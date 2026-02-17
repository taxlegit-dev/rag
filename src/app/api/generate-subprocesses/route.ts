export const runtime = "nodejs";
import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ChatRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatContextMessages, saveChatMessage } from "@/lib/chat";
import {
  buildRagQuery,
  formatRagContext,
  getRagContext,
} from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { process: processName, projectSessionId } = body;
    let verifiedProjectSessionId: string | null = null;

    if (!processName || typeof processName !== "string") {
      return NextResponse.json(
        { error: "Process name is required" },
        { status: 400 },
      );
    }

    if (projectSessionId) {
      const projectSession = await prisma.projectSession.findFirst({
        where: {
          id: projectSessionId,
          userId: session.user.id,
        },
      });

      if (!projectSession) {
        return NextResponse.json(
          { error: "Session not found or access denied" },
          { status: 404 },
        );
      }

      verifiedProjectSessionId = projectSessionId;
    }

    const companyDetails =
      typeof body.companyDetails === "string" && body.companyDetails.trim()
        ? body.companyDetails.trim()
        : "Not provided";

    const chatContext = verifiedProjectSessionId
      ? await getChatContextMessages(verifiedProjectSessionId)
      : [];

    if (verifiedProjectSessionId) {
      try {
        await saveChatMessage(
          verifiedProjectSessionId,
          ChatRole.USER,
          `Generate subprocesses.\nProcess: ${processName}\nCompany details:\n${companyDetails}`,
        );
      } catch (error) {
        console.warn("Failed to save chat message:", error);
      }
    }

    const ragQuery = buildRagQuery([
      companyDetails,
      `Process: ${processName}`,
      "ICFR subprocess identification",
    ]);
    const ragChunks = await getRagContext(ragQuery);

    if (ragChunks.length === 0) {
      return NextResponse.json(
        {
          error: "No RAG context available. Please upload documents.",
        },
        { status: 409 },
      );
    }

    const ragContext = formatRagContext(ragChunks);

    const prompt = `
RAG CONTEXT (authoritative):
${ragContext}

Company details (PRIMARY CONTEXT):
${companyDetails}

You are an expert in business processes and Internal Controls over Financial Reporting (ICFR), aligned with the ICAI Guidance Note.

Your task is to identify realistic and relevant subprocesses under the business process "${processName}" where SOPs and/or internal controls are typically required.

Guidelines:
- Use ONLY the RAG CONTEXT above as your source of truth.
- Treat the company details as PRIMARY context and tailor subprocesses to that business (industry, size, footprint, systems, model).
- Exclude subprocesses that are not applicable to the company details.
- Use standard business terminology.
- If the RAG CONTEXT does not contain enough information, return an empty array.
Return STRICTLY in the following JSON format only:
{
  "process": "${processName}",
"subprocesses": ["Subprocess 1", "Subprocess 2", "Subprocess 3", "..."]
}
`;

    console.log("Prompt sent to OpenAI for subprocesses:", prompt);

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
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate subprocesses" },
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
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 },
      );
    }

    if (
      !parsedResponse.subprocesses ||
      !Array.isArray(parsedResponse.subprocesses)
    ) {
      return NextResponse.json(
        { error: "Invalid subprocesses format" },
        { status: 500 },
      );
    }

    if (verifiedProjectSessionId) {
      try {
        await saveChatMessage(
          verifiedProjectSessionId,
          ChatRole.ASSISTANT,
          aiResponse,
        );
      } catch (error) {
        console.warn("Failed to save chat message:", error);
      }
    }

    return NextResponse.json({
      process: parsedResponse.process || processName,
      subprocesses: parsedResponse.subprocesses,
    });
  } catch (error) {
    console.error("Error generating subprocesses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
