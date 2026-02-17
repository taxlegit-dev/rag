import "dotenv/config";
import readline from "node:readline";
import { PrismaClient, ChatRole } from "@prisma/client";
import OpenAI from "openai";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

const prisma = new PrismaClient();

const DEFAULT_CONTEXT_LIMIT = 6;
const HISTORY_LIMIT = 20;

function parseArg(name: string) {
  const index = process.argv.findIndex((arg) => arg === name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

async function selectSession(): Promise<string> {
  const sessionArg = parseArg("--session") || parseArg("--sessionId");
  if (sessionArg) return sessionArg;

  const sessions = await prisma.projectSession.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, name: true, userId: true, createdAt: true },
  });

  if (sessions.length === 0) {
    throw new Error("No ProjectSession found. Create one first.");
  }

  console.log("Recent ProjectSessions:");
  sessions.forEach((session, index) => {
    console.log(
      `${index + 1}. ${session.name} | ${session.id} | user ${session.userId}`
    );
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question("Enter session id: ", (value) => resolve(value.trim()));
  });
  rl.close();

  if (!answer) {
    throw new Error("Session id is required.");
  }

  return answer;
}

async function fetchMessages(projectSessionId: string, limit: number) {
  const messages = await prisma.chatMessage.findMany({
    where: { projectSessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return messages.reverse();
}

async function fetchContext(projectSessionId: string) {
  const messages = await prisma.chatMessage.findMany({
    where: { projectSessionId },
    orderBy: { createdAt: "desc" },
    take: DEFAULT_CONTEXT_LIMIT,
  });

  return messages
    .reverse()
    .map((message) => ({
      role:
        message.role === "USER"
          ? "user"
          : message.role === "ASSISTANT"
          ? "assistant"
          : "system",
      content: message.content,
    })) as Message[];
}

function printMessages(messages: Awaited<ReturnType<typeof fetchMessages>>) {
  console.log("-".repeat(72));
  messages.forEach((message) => {
    const role =
      message.role === "USER"
        ? "You"
        : message.role === "ASSISTANT"
        ? "AI"
        : "System";
    const time = new Date(message.createdAt).toLocaleTimeString();
    console.log(`[${time}] ${role}: ${message.content}`);
  });
  console.log("-".repeat(72));
}

async function saveMessage(
  projectSessionId: string,
  role: ChatRole,
  content: string
) {
  const trimmed = content.trim();
  if (!trimmed) return;
  await prisma.chatMessage.create({
    data: { projectSessionId, role, content: trimmed },
  });
}

async function main() {
  const projectSessionId = await selectSession();
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const modelId = process.env.MODEL_ID;

  if (!openaiApiKey || !modelId) {
    throw new Error("OPENAI_API_KEY and MODEL_ID must be set in env.");
  }

  const systemPrompt =
    parseArg("--system") ||
    process.env.CHAT_SYSTEM_PROMPT ||
    "You are an ICFR SOP assistant. Be concise and helpful.";

  const openai = new OpenAI({ apiKey: openaiApiKey });

  const existing = await fetchMessages(projectSessionId, HISTORY_LIMIT);
  if (existing.length > 0) {
    printMessages(existing);
  } else {
    console.log("No chat history yet.");
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptInput = async () => {
    const input = await new Promise<string>((resolve) => {
      rl.question("You: ", (value) => resolve(value));
    });

    const trimmed = input.trim();
    if (!trimmed) return promptInput();

    if (trimmed.toLowerCase() === "/exit") {
      rl.close();
      await prisma.$disconnect();
      return;
    }

    if (trimmed.toLowerCase() === "/history") {
      const history = await fetchMessages(projectSessionId, HISTORY_LIMIT);
      printMessages(history);
      return promptInput();
    }

    await saveMessage(projectSessionId, ChatRole.USER, trimmed);

    const context = await fetchContext(projectSessionId);
    const completion = await openai.responses.create({
      model: modelId,
      input: [
        { role: "system", content: systemPrompt },
        ...context,
      ],
    });

    const reply = completion.output_text?.trim() || "(no response)";
    await saveMessage(projectSessionId, ChatRole.ASSISTANT, reply);
    console.log(`AI: ${reply}`);

    return promptInput();
  };

  console.log('Type "/exit" to quit, "/history" to show recent messages.');
  await promptInput();
}

main().catch(async (error) => {
  console.error("Chat console error:", error);
  await prisma.$disconnect();
  process.exit(1);
});
