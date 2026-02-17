import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import OpenAI from "openai";
import { Task } from "../../../../types";

const prisma = new PrismaClient();
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

// Expand to fine-tune prompt format
function buildTrainingLikePrompt(
  processName: string,
  subprocessName: string,
  task: Task
): string {
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
${task.steps.map((s) => `Step ${s.step_no} – ${s.action}`).join("\n")}

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

export async function POST(request: NextRequest) {
  try {
    const { subprocessId, taskIndex } = await request.json();

    const subprocess = await prisma.subprocess.findUnique({
      where: { id: subprocessId },
      include: { process: true },
    });

    const tasks = subprocess!.tasks as unknown as Task[];
    const task = tasks[taskIndex];

    // Detect missing fields
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

    const missing = requiredFields.filter((f) => !task[f]);

    if (missing.length === 0) {
      return NextResponse.json({ message: "Nothing missing", task });
    }

    // Build training-like long prompt automatically
    const longPrompt = buildTrainingLikePrompt(
      subprocess!.process.name,
      subprocess!.name,
      task
    );

    const completion = await openai.responses.create({
      model: process.env.OPENAI_RCM_MODEL_ID!,
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

    const raw = completion.output_text.trim();
    const cleaned = raw.replace(/^[^{]+/, "").replace(/[^}]+$/, "");

    const generated = JSON.parse(cleaned);
    const normalized = normalizeGeneratedRCMFields(generated);

    // Apply missing fields
    // Apply missing fields safely
    missing.forEach((field) => {
      const key = field as keyof Task;
      if (hasMeaningfulValue(normalized[key])) {
        (task as any)[key] = normalized[key];
      }
    });

    tasks[taskIndex] = task;

    await prisma.subprocess.update({
      where: { id: subprocessId },
      data: { tasks: tasks as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({
      message: "RCM fields updated",
      task,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
