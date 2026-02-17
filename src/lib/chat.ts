import { ChatRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ChatCompletionRole = "user" | "assistant" | "system";

const DEFAULT_CONTEXT_LIMIT = 6;
const MAX_CONTEXT_CHARS = 2000;

const ROLE_MAP: Record<ChatRole, ChatCompletionRole> = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
};

function truncateForPrompt(content: string) {
  const normalized = content.trim();
  if (normalized.length <= MAX_CONTEXT_CHARS) return normalized;
  return `${normalized.slice(0, MAX_CONTEXT_CHARS)} ...[truncated]`;
}

export async function getChatContextMessages(
  projectSessionId: string,
  limit = DEFAULT_CONTEXT_LIMIT
) {
  const messages = await prisma.chatMessage.findMany({
    where: { projectSessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return messages
    .reverse()
    .map((message) => ({
      role: ROLE_MAP[message.role],
      content: truncateForPrompt(message.content),
    }));
}

export async function saveChatMessage(
  projectSessionId: string,
  role: ChatRole,
  content: string
) {
  const trimmed = content?.trim();
  if (!projectSessionId || !trimmed) return;

  await prisma.chatMessage.create({
    data: {
      projectSessionId,
      role,
      content: trimmed,
    },
  });
}
