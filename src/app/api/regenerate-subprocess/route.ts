export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ChatRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatContextMessages, saveChatMessage } from "@/lib/chat";

function getRequiredTaskCount(message: string): number | null {
  if (!message) return null;
  const patterns = [
    /(?:at\s+least|min(?:imum)?|no\s+less\s+than)\s+(\d+)\s+tasks?/i,
    /(?:generate|create|make|need|want)\s+(\d+)\s+tasks?/i,
    /(\d+)\s+tasks?\s+(?:minimum|at\s+least)/i,
    /kam\s+se\s+kam\s+(\d+)\s+tasks?/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const value = Number.parseInt(match[1], 10);
      if (Number.isFinite(value) && value > 0) return value;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subprocessId, customMessage } = await request.json();

    if (!subprocessId || typeof subprocessId !== "string") {
      return NextResponse.json(
        { error: "subprocessId is required" },
        { status: 400 },
      );
    }

    if (!customMessage || typeof customMessage !== "string") {
      return NextResponse.json(
        { error: "customMessage is required" },
        { status: 400 },
      );
    }

    const subprocess = await prisma.subprocess.findFirst({
      where: {
        id: subprocessId,
      },
      include: {
        subUserAssignments: true,
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

    const ownerUserId = subprocess.process.projectSession.userId;
    const isSubUser = session.user.role === "subuser";
    const isOwner = !isSubUser && ownerUserId === session.user.id;
    const isAssignedSubUser =
      isSubUser &&
      session.user.userId === ownerUserId &&
      subprocess.subUserAssignments.some(
        (assignment) => assignment.subUserId === session.user.id,
      );

    if (!isOwner && !isAssignedSubUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let companyDetails = "";
    subprocess.process.projectSession.answers.forEach((answer) => {
      if (answer.question && answer.answer) {
        companyDetails += `${answer.question.questionText}: ${answer.answer}\n`;
      }
    });

    const projectSessionId = subprocess.process.projectSession.id;
    const chatContext = await getChatContextMessages(projectSessionId);

    try {
      await saveChatMessage(
        projectSessionId,
        ChatRole.USER,
        `Regenerate subprocess.\nProcess: ${subprocess.process.name}\nSubprocess: ${subprocess.name}\nRequest: ${customMessage}`
      );
    } catch (error) {
      console.warn("Failed to save chat message:", error);
    }

    const requiredTaskCount = getRequiredTaskCount(customMessage);
    const taskCountInstruction = requiredTaskCount
      ? `You MUST generate at least ${requiredTaskCount} tasks.`
      : "Generate a complete set of tasks that fully covers the subprocess.";

    const prompt = `You are a compliance SOP generator.

Return ONLY valid JSON in this exact shape:
{
  "process": "Process Name",
  "subprocess": "Subprocess Name",
  "tasks": [
    {
      "task": "Task name",
      "makers": "Role – responsibility",
      "checkers": "Role – responsibility",
      "steps": [
        {
          "step_no": 1,
          "action": "Action description",
          "risk": "Risk description",
          "mitigation": "Mitigation description"
        }
      ]
    }
  ]
}

Additional rules:
- ${taskCountInstruction}
- Do NOT copy existing tasks verbatim. Use them only as background reference.
- Each task must include at least 3 steps with sequential step numbers.

Company Details:
${companyDetails || "Not provided"}

Process: ${subprocess.process.name}
Subprocess: ${subprocess.name}

Existing Tasks (for reference only):
${JSON.stringify(subprocess.tasks, null, 2)}

Customization Request:
${customMessage}

Regenerate the entire subprocess with updated, compliance-ready tasks.
Ensure the tasks align with the customization request.`;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const modelId = process.env.MODEL_ID;

    if (!openaiApiKey || !modelId) {
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
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to regenerate subprocess" },
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

    let regeneratedSubprocess;
    try {
      regeneratedSubprocess = JSON.parse(aiResponse);
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 },
      );
    }

    if (!Array.isArray(regeneratedSubprocess.tasks)) {
      return NextResponse.json(
        { error: "Invalid subprocess format from AI" },
        { status: 500 },
      );
    }

    if (
      requiredTaskCount &&
      regeneratedSubprocess.tasks.length < requiredTaskCount
    ) {
      return NextResponse.json(
        {
          error:
            "AI returned fewer tasks than requested. Please regenerate with a clearer request.",
        },
        { status: 500 },
      );
    }

    await prisma.subprocess.update({
      where: {
        id: subprocessId,
      },
      data: {
        tasks: regeneratedSubprocess.tasks,
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

    return NextResponse.json({
      success: true,
      tasks: regeneratedSubprocess.tasks,
    });
  } catch (error) {
    console.error("Error regenerating subprocess:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
