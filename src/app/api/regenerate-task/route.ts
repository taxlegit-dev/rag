export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ChatRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatContextMessages, saveChatMessage } from "@/lib/chat";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subprocessId, taskIndex, customMessage } = body;

    // Validate inputs
    if (!subprocessId || typeof subprocessId !== "string") {
      return NextResponse.json(
        { error: "Subprocess ID is required" },
        { status: 400 },
      );
    }

    if (typeof taskIndex !== "number" || taskIndex < 0) {
      return NextResponse.json(
        { error: "Valid task index is required" },
        { status: 400 },
      );
    }

    if (!customMessage || typeof customMessage !== "string") {
      return NextResponse.json(
        { error: "Custom message is required" },
        { status: 400 },
      );
    }

    // Fetch subprocess with process and project session
    const subprocess = await prisma.subprocess.findFirst({
      where: {
        id: subprocessId,
      },
      include: {
        process: {
          include: {
            projectSession: {
              include: {
                answers: {
                  include: {
                    question: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!subprocess) {
      return NextResponse.json(
        { error: "Subprocess not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (subprocess.process.projectSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get current tasks
    const currentTasks = subprocess.tasks as any[];

    if (taskIndex >= currentTasks.length) {
      return NextResponse.json(
        { error: "Invalid task index" },
        { status: 400 },
      );
    }

    const currentTask = currentTasks[taskIndex];

    // Build company details from answers
    let companyDetails = "";
    subprocess.process.projectSession.answers.forEach((answer) => {
      if (answer.question && answer.answer) {
        companyDetails += `${answer.question.questionText}: ${answer.answer}\n`;
      }
    });

    const currentMakers = currentTask?.makers || "";
    const currentCheckers = currentTask?.checkers || "";

    const projectSessionId = subprocess.process.projectSession.id;
    const chatContext = await getChatContextMessages(projectSessionId);

    try {
      await saveChatMessage(
        projectSessionId,
        ChatRole.USER,
        `Regenerate task.\nProcess: ${subprocess.process.name}\nSubprocess: ${subprocess.name}\nTask: ${currentTask.task}\nRequest: ${customMessage}`
      );
    } catch (error) {
      console.warn("Failed to save chat message:", error);
    }

    // Create prompt for OpenAI to regenerate the specific task
    const prompt = `You are a compliance SOP generator.

Based on the company details and customization request below, regenerate ONLY ONE task for the given process and subprocess.

Return ONLY valid JSON in this exact format:
{
  "task": "Task name",
  "makers": "Role \u2013 responsibility",
  "checkers": "Role \u2013 responsibility",
  "steps": [
    {
      "step_no": 1,
      "action": "Action description",
      "risk": "Risk description",
      "mitigation": "Mitigation description"
    }
  ]
}

Company Details:
${companyDetails}

Process: ${subprocess.process.name}
Subprocess: ${subprocess.name}

Current Task Being Regenerated:
${currentTask.task}

Current Maker:
${currentMakers || "Not provided"}

Current Checker:
${currentCheckers || "Not provided"}

Customization Request:
${customMessage}

Generate 3-4 steps for this task. Also regenerate makers and checkers to match the updated task. Ensure the task aligns with the customization request while maintaining compliance standards.`;

    // Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const modelId = process.env.MODEL_ID;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          ...chatContext,
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to regenerate task" },
        { status: 500 },
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
      );
    }

    // Parse the JSON response
    let regeneratedTask;
    try {
      regeneratedTask = JSON.parse(aiResponse);
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 },
      );
    }

    // Validate regenerated task structure
    if (
      !regeneratedTask.task ||
      !Array.isArray(regeneratedTask.steps) ||
      regeneratedTask.steps.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid task format from AI" },
        { status: 500 },
      );
    }

    if (!regeneratedTask.makers || typeof regeneratedTask.makers !== "string") {
      regeneratedTask.makers = currentMakers;
    }

    if (
      !regeneratedTask.checkers ||
      typeof regeneratedTask.checkers !== "string"
    ) {
      regeneratedTask.checkers = currentCheckers;
    }

    // Update the task in the tasks array
    const updatedTasks = [...currentTasks];
    updatedTasks[taskIndex] = regeneratedTask;

    // Update subprocess in database
    await prisma.subprocess.update({
      where: {
        id: subprocessId,
      },
      data: {
        tasks: updatedTasks,
      },
    });

    try {
      await saveChatMessage(
        projectSessionId,
        ChatRole.ASSISTANT,
        aiResponse
      );
    } catch (error) {
      console.warn("Failed to save chat message:", error);
    }

    console.log("Task regenerated and updated in DB:", {
      subprocessId,
      taskIndex,
      regeneratedTask,
    });

    return NextResponse.json({
      success: true,
      task: regeneratedTask,
      taskIndex,
    });
  } catch (error) {
    console.error("Error regenerating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
