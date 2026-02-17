export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ChatRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatContextMessages, saveChatMessage } from "@/lib/chat";
import OpenAI from "openai";
import type { Task } from "../../../../types";
import {
  buildRagQuery,
  formatRagContext,
  getRagContext,
} from "@/lib/rag";

function normalizeName(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const FIELD_ALIASES: Record<keyof Task, string[]> = {
  riskDescription: [
    "riskDescription",
    "risk_description",
    "Risk Description",
    "RiskDescription",
    "riskDesc",
  ],
  riskRating: ["riskRating", "risk_rating", "Risk Rating", "RiskRating"],
  fraudRisk: ["fraudRisk", "fraud_risk", "Fraud Risk", "FraudRisk"],
  financialStatementAssertionControl: [
    "financialStatementAssertionControl",
    "financialStatementAssertion",
    "financialAssertion",
    "Financial Statement Assertion",
    "Financial Assertion",
    "financial_statement_assertion",
  ],
  controlReference: [
    "controlReference",
    "control_reference",
    "Control Reference",
    "controlRef",
  ],
  isOperationalFinancialKeyControl: [
    "isOperationalFinancialKeyControl",
    "keyControl",
    "Key Control",
    "key_control",
    "isKeyControl",
  ],
  frequencyOfControl: [
    "frequencyOfControl",
    "frequency",
    "Frequency of Control",
  ],
  natureOfControl: ["natureOfControl", "nature", "Nature of Control"],
  itApplicationUsed: [
    "itApplicationUsed",
    "itUsed",
    "IT Application Used",
    "it_application_used",
  ],
  spocControlOwner: [
    "spocControlOwner",
    "spoc",
    "SPOC/Control Owner",
    "controlOwner",
    "control_owner",
  ],
  controlAsIs: [
    "controlAsIs",
    "control_as_is",
    "Control As-Is (Current Procedure)",
    "Control As Is",
  ],
  task: ["task"],
  makers: ["makers"],
  checkers: ["checkers"],
  steps: ["steps"],
  riskReference: ["riskReference"],
  risk: ["risk"],
  financialAssertion: ["financialAssertion"],
  operationalFinancial: ["operationalFinancial"],
  keyControl: ["keyControl"],
  existingProcess: ["existingProcess"],
};

function normalizeGeneratedRCMFields(generated: Record<string, unknown>) {
  const normalized: Partial<Task> = {};
  (Object.keys(FIELD_ALIASES) as (keyof Task)[]).forEach((field) => {
    for (const alias of FIELD_ALIASES[field]) {
      if (generated[alias] !== undefined && generated[alias] !== null) {
        (normalized as any)[field] = generated[alias];
        break;
      }
    }
  });

  if (normalized.isOperationalFinancialKeyControl !== undefined) {
    const raw = normalized.isOperationalFinancialKeyControl as any;
    if (typeof raw === "string") {
      const value = raw.trim().toLowerCase();
      if (value === "yes" || value === "true") {
        normalized.isOperationalFinancialKeyControl = true;
      } else if (value === "no" || value === "false") {
        normalized.isOperationalFinancialKeyControl = false;
      }
    }
  }

  if (normalized.fraudRisk !== undefined) {
    const raw = normalized.fraudRisk as any;
    if (typeof raw === "boolean") {
      normalized.fraudRisk = raw ? "Yes" : "No";
    }
  }

  if (normalized.riskRating !== undefined) {
    const raw = normalized.riskRating as any;
    if (typeof raw === "number") {
      normalized.riskRating = String(raw);
    }
  }

  return normalized;
}

function hasMeaningfulValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function buildTrainingLikePrompt(
  processName: string,
  subprocessName: string,
  task: Task
) {
  const steps = Array.isArray(task.steps) ? task.steps : [];
  return `
Process: ${processName}
Subprocess: ${subprocessName}
Task: ${task.task}

Risk Ref: ${task.riskReference || "R?"}
Risk: ${task.risk || "NA"}
Risk Description: ${task.riskDescription || ""}
Risk Rating: ${task.riskRating || ""}
Fraud Risk: ${task.fraudRisk || ""}
Financial Assertion: ${task.financialAssertion || ""}

Existing Process:
${steps.map((s) => `Step ${s.step_no} - ${s.action}`).join("\n")}

Control As Is: ${task.controlAsIs || ""}

Control Ref: ${task.controlReference || ""}
Operational/Financial: ${task.operationalFinancial || ""}
Key Control: ${task.isOperationalFinancialKeyControl}
Frequency: ${task.frequencyOfControl || ""}
Nature: ${task.natureOfControl || ""}
IT Used: ${task.itApplicationUsed || ""}
SPOC: ${task.spocControlOwner || ""}

Return ONLY valid JSON with these exact keys:
{
  "riskDescription": string,
  "riskRating": string,
  "fraudRisk": "Yes" | "No",
  "financialStatementAssertionControl": string,
  "controlReference": string,
  "isOperationalFinancialKeyControl": boolean,
  "frequencyOfControl": string,
  "natureOfControl": string,
  "itApplicationUsed": string,
  "spocControlOwner": string,
  "controlAsIs": string
}
Only fill missing fields with meaningful, non-empty values.
Do NOT return empty strings for any field.
`;
}

async function fillMissingRCMFields(
  processName: string,
  subprocessName: string,
  tasks: Task[]
) {
  const requiredFields: (keyof Task)[] = [
    "riskDescription",
    "riskRating",
    "fraudRisk",
    "financialStatementAssertionControl",
    "controlReference",
    "isOperationalFinancialKeyControl",
    "frequencyOfControl",
    "natureOfControl",
    "itApplicationUsed",
    "spocControlOwner",
    "controlAsIs",
  ];

  const modelId = process.env.OPENAI_RCM_MODEL_ID || process.env.MODEL_ID;
  const parallelRaw = Number.parseInt(process.env.RCM_PARALLEL || "3", 10);
  const parallel = Number.isFinite(parallelRaw) && parallelRaw > 0
    ? Math.min(parallelRaw, 6)
    : 3;

  console.log("RCM prefill start:", {
    process: processName,
    subprocess: subprocessName,
    taskCount: Array.isArray(tasks) ? tasks.length : 0,
    model: modelId ? "configured" : "missing",
    parallel,
  });
  if (!modelId) {
    console.warn("RCM model ID not configured. Skipping RCM field generation.");
    return tasks;
  }

  const updatedTasks = [...tasks];
  let sampleLogged = false;

  const results: Task[] = new Array(updatedTasks.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(parallel, updatedTasks.length) })
    .map(async () => {
      while (true) {
        const index = cursor;
        cursor += 1;
        if (index >= updatedTasks.length) break;

        const task = updatedTasks[index];
        const missing = requiredFields.filter((field) => !task?.[field]);
        if (missing.length > 0) {
          console.log("RCM prefill task:", {
            index,
            task: task?.task,
            missingCount: missing.length,
          });
        }
        if (missing.length === 0) {
          results[index] = task;
          continue;
        }

        try {
          const longPrompt = buildTrainingLikePrompt(
            processName,
            subprocessName,
            task
          );

          const completion = await openai.responses.create({
            model: modelId,
            input: [
              {
                role: "system",
                content:
                  "You generate RCM fields in structured JSON for a given PROCESS, SUBPROCESS and TASK. ONLY return JSON.",
              },
              {
                role: "user",
                content: longPrompt,
              },
            ],
          });

          const raw = completion.output_text?.trim() || "";
          const cleaned = raw.replace(/^[^{]+/, "").replace(/[^}]+$/, "");
          if (!cleaned) {
            results[index] = task;
            continue;
          }

          const generated = JSON.parse(cleaned);
          const normalized = normalizeGeneratedRCMFields(generated);
          if (!sampleLogged) {
            console.log("RCM prefill sample output:", {
              task: task?.task,
              rawPreview: raw.slice(0, 500),
              normalizedKeys: Object.keys(normalized),
            });
            sampleLogged = true;
          }
          missing.forEach((field) => {
            if (hasMeaningfulValue(normalized[field])) {
              (task as any)[field] = normalized[field];
            }
          });
          results[index] = task;
        } catch (error) {
          console.warn("RCM generation failed for task:", task?.task, error);
          results[index] = task;
        }
      }
    });

  await Promise.all(workers);

  console.log("RCM prefill complete:", {
    process: processName,
    subprocess: subprocessName,
  });
  return results;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const isAdmin = (session.user.role || "").toLowerCase() === "admin";

    const body = await request.json();
    const { process: businessProcess, subprocess, projectSessionId } = body;
    let verifiedProjectSessionId: string | null = null;

    if (
      !businessProcess ||
      !subprocess ||
      typeof businessProcess !== "string" ||
      typeof subprocess !== "string"
    ) {
      return NextResponse.json(
        { error: "Process and subprocess are required" },
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

    const ragQuery = buildRagQuery([
      `Process: ${businessProcess}`,
      `Subprocess: ${subprocess}`,
      "ICFR SOP generation",
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

    const systemPrompt = `
RAG CONTEXT (authoritative):
${ragContext}

Generate an SOP and return ONLY valid JSON.

FORMAT:
{
  "process": string,
  "subprocess": string,
  "tasks": [
    {
      "task": string,
      "makers": string,
      "checkers": string,
      "steps": [
        {
          "step_no": number,
          "action": string,
          "risk": string,
          "mitigation": string
        }
      ]
    }
  ]
}

RULES:
- Use ONLY the RAG CONTEXT above as your source of truth.
- Output ONLY valid JSON. No extra text.
- Steps must describe real actions performed in systems (HRMS / CRM / ERP).
- "makers" must be written as a single professional paragraph.
- Maker description must be between 50 and 70 words.
- Use formal business language similar to internal SOP documentation.
- If the RAG CONTEXT does not contain enough information, return an empty tasks array.
`;

    const userPrompt = `
Process: ${businessProcess}
Subprocess: ${subprocess}
`;

    console.log("System Prompt:", systemPrompt);
    console.log("User Prompt:", userPrompt);

    const chatContext = verifiedProjectSessionId
      ? await getChatContextMessages(verifiedProjectSessionId)
      : [];

    if (verifiedProjectSessionId) {
      try {
        await saveChatMessage(
          verifiedProjectSessionId,
          ChatRole.USER,
          `Generate SOP.\nProcess: ${businessProcess}\nSubprocess: ${subprocess}`
        );
      } catch (error) {
        console.warn("Failed to save chat message:", error);
      }
    }

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
          { role: "system", content: systemPrompt },
          ...chatContext,
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate detailed SOP" },
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

    // Validate structure
    if (
      !parsedResponse.process ||
      !parsedResponse.subprocess ||
      !Array.isArray(parsedResponse.tasks)
    ) {
      return NextResponse.json(
        { error: "Invalid SOP format" },
        { status: 500 },
      );
    }

    parsedResponse.tasks = await fillMissingRCMFields(
      parsedResponse.process,
      parsedResponse.subprocess,
      parsedResponse.tasks
    );

    // If projectSessionId is provided, save the SOP to database
    if (verifiedProjectSessionId) {

      const normalizedProcess = normalizeName(parsedResponse.process);
      const normalizedSubprocess = normalizeName(parsedResponse.subprocess);

      await prisma.$transaction(async (tx) => {
        let process = await tx.process.findUnique({
          where: {
            projectSessionId_name: {
              projectSessionId: verifiedProjectSessionId,
              name: normalizedProcess,
            },
          },
        });

        if (!process) {
          let createdProcess = false;
          try {
            process = await tx.process.create({
              data: {
                projectSessionId: verifiedProjectSessionId,
                name: normalizedProcess,
              },
            });
            createdProcess = true;
          } catch (error) {
            const existing = await tx.process.findUnique({
              where: {
                projectSessionId_name: {
                  projectSessionId: verifiedProjectSessionId,
                  name: normalizedProcess,
                },
              },
            });
            if (!existing) {
              throw error;
            }
            process = existing;
          }

          if (createdProcess) {
            if (!isAdmin) {
              const processDebit = await tx.user.updateMany({
                where: {
                  id: session.user.id,
                  remainingProcesses: { gt: 0 },
                },
                data: {
                  remainingProcesses: { decrement: 1 },
                },
              });

              if (processDebit.count === 0) {
                throw new Error("PROCESS_CREDITS_EXHAUSTED");
              }
            }
          }
        }

        if (!process) {
          throw new Error("PROCESS_CREATE_FAILED");
        }

        let subprocess = await tx.subprocess.findUnique({
          where: {
            processId_name: {
              processId: process.id,
              name: normalizedSubprocess,
            },
          },
        });

        if (!subprocess) {
          let createdSubprocess = false;
          try {
            subprocess = await tx.subprocess.create({
              data: {
                processId: process.id,
                name: normalizedSubprocess,
                tasks: parsedResponse.tasks,
              },
            });
            createdSubprocess = true;
          } catch (error) {
            const existing = await tx.subprocess.findUnique({
              where: {
                processId_name: {
                  processId: process.id,
                  name: normalizedSubprocess,
                },
              },
            });
            if (!existing) {
              throw error;
            }
            subprocess = existing;
          }

          if (createdSubprocess) {
            if (!isAdmin) {
              const subprocessDebit = await tx.user.updateMany({
                where: {
                  id: session.user.id,
                  remainingSubprocesses: { gt: 0 },
                },
                data: {
                  remainingSubprocesses: { decrement: 1 },
                },
              });

              if (subprocessDebit.count === 0) {
                throw new Error("SUBPROCESS_CREDITS_EXHAUSTED");
              }
            }
          }
        } else {
          await tx.subprocess.update({
            where: { id: subprocess.id },
            data: {
              name: normalizedSubprocess,
              tasks: parsedResponse.tasks,
            },
          });
        }
      });

      console.log(
        "Process and Subprocess saved to DB via generate-detailed-sop:",
        {
          process: parsedResponse.process,
          subprocess: parsedResponse.subprocess,
        },
      );
    }

    if (verifiedProjectSessionId) {
      try {
        await saveChatMessage(
          verifiedProjectSessionId,
          ChatRole.ASSISTANT,
          aiResponse
        );
      } catch (error) {
        console.warn("Failed to save chat message:", error);
      }
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "PROCESS_CREDITS_EXHAUSTED" ||
        error.message === "SUBPROCESS_CREDITS_EXHAUSTED")
    ) {
      return NextResponse.json(
        {
          error:
            error.message === "PROCESS_CREDITS_EXHAUSTED"
              ? "Process credits exhausted. Please recharge to generate more processes."
              : "Subprocess credits exhausted. Please recharge to generate more subprocesses.",
        },
        { status: 403 },
      );
    }
    console.error("Error generating detailed SOP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
