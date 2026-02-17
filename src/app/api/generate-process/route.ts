export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ChatRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatContextMessages, saveChatMessage } from "@/lib/chat";
import { buildRagQuery, formatRagContext, getRagContext } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answers, projectSessionId } = body;
    let verifiedProjectSessionId: string | null = null;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 },
      );
    }

    // If projectSessionId is provided, save answers to database
    console.log("Generate SOP called with projectSessionId:", projectSessionId);
    if (projectSessionId) {
      // Verify the session belongs to the user
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

      // Save answers to database
      await prisma.answer.deleteMany({
        where: {
          projectSessionId,
        },
      });

      const answerPromises = Object.entries(answers).map(
        async ([questionId, answerValue]) => {
          if (
            answerValue !== null &&
            answerValue !== undefined &&
            answerValue !== ""
          ) {
            return prisma.answer.create({
              data: {
                projectSessionId,
                questionId,
                answer: answerValue,
              },
            });
          }
          return null;
        },
      );

      await Promise.all(answerPromises);

      console.log("Answers saved to DB via generate-sop:", answers);
    }

    // Fetch questions to map answers
    const questions = await prisma.question.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // Construct company details from questions and answers
    let companyDetails = "";
    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer !== null && answer !== undefined && answer !== "") {
        companyDetails += `${question.questionText}: ${answer}\n`;
      }
    });

    const chatContext = verifiedProjectSessionId
      ? await getChatContextMessages(verifiedProjectSessionId)
      : [];
    // is session ki purani saari messages lo

    if (verifiedProjectSessionId) {
      try {
        await saveChatMessage(
          verifiedProjectSessionId,
          ChatRole.USER,
          `Generate processes.\nCompany details:\n${companyDetails || "Not provided"}`,
        );
      } catch (error) {
        console.warn("Failed to save chat message:", error);
      }
    }

    const ragQuery = buildRagQuery([
      companyDetails,
      "ICFR process identification",
    ]);
    const ragChunks = await getRagContext(ragQuery);
    // database mein se similar chunks dhundo vector search se

    if (ragChunks.length === 0) {
      return NextResponse.json(
        {
          error: "No RAG context available. Please upload documents.",
        },
        { status: 409 },
      );
    }

    const ragContext = formatRagContext(ragChunks);
    // chunks ko readable text mein format karo

    const prompt = `
RAG CONTEXT (authoritative):
${ragContext}

Company Details:
${companyDetails}

You are an expert in business processes and Internal Controls over Financial Reporting (ICFR), aligned with the ICAI Guidance Note. You specialize in identifying high-level business processes that require Standard Operating Procedures (SOPs) and internal controls.

TASK:
Identify HIGH-LEVEL BUSINESS PROCESSES applicable to this company.

PROCESS IDENTIFICATION FRAMEWORK:

A. FIRST – Include the following PROCESSES if relevant; otherwise, do not include them:
1. Order to Cash (O2C)
2. Procure to Pay (P2P)
3. Record to Report (R2R)
4. Treasury & Banking
5. Taxation & Statutory Compliance
6. Fixed Assets Management
7. Human Resource & Payroll (Hire to Retire)
8. IT General Controls (ITGC)
9. Financial Reporting & MIS
10. Internal Financial Controls & Audit

B. SECOND – For additional processes, analyze the company details provided above and include only those processes that are specifically relevant to the company.

C. STRICT ANALYSIS RULES:
- Use ONLY the RAG CONTEXT above as your source of truth.
- Add additional processes ONLY if they are logically required for this specific company.
- Do NOT add manufacturing-related processes if the company operates purely in the service sector.
- Focus only on realistic and practical operational processes based on the given business profile.
- If the RAG CONTEXT does not contain enough information, return an empty array.

Return STRICTLY in the following JSON format only:

{
  "processes": ["Process 1", "Process 2", "Process 3", ...]
}
`;

    console.log("Prompt sent to OpenAI:", prompt);

    // Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const modelId = process.env.MODEL_ID;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const messages = [
      ...chatContext, // purani conversation history
      {
        role: "user",
        content: prompt, // RAG context + company details + instructions
      },
    ];
    console.log("LLM MESSAGES:", JSON.stringify(messages, null, 2));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages, // dono context saath
        max_tokens: 600,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate processes" },
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

    if (!parsedResponse.processes || !Array.isArray(parsedResponse.processes)) {
      return NextResponse.json(
        { error: "Invalid processes format" },
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

    return NextResponse.json({ processes: parsedResponse.processes });
  } catch (error) {
    console.error("Error generating SOP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
