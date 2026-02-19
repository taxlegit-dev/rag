import OpenAI from "openai";
import { Domain, Prisma } from "@prisma/client";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { prisma } from "@/lib/prisma";

export interface RagContextChunk {
  content: string;
  sourceFileName: string | null;
  documentId: string;
  distance: number;
}

const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL_ID || "text-embedding-3-small";
const EMBEDDING_DIM = Number(process.env.EMBEDDING_DIM || 1536);
const DEFAULT_CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE || 1200);
const DEFAULT_CHUNK_OVERLAP = Number(process.env.RAG_CHUNK_OVERLAP || 200);
const DEFAULT_TOP_K = Number(process.env.RAG_TOP_K || 8);


export function cleanText(input: string): string {
  return (
    input
      // Normalize line endings
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")

      // Fix hyphenated line breaks (commu-\nnication → communication)
      .replace(/-\n/g, "")

      // Fix mid-word line breaks only (lowercase→lowercase)
      .replace(/([a-z])\n([a-z])/g, "$1$2")

      // Single \n jo words ke beech hai → space bana do
      .replace(/([^\n])\n([^\n])/g, "$1 $2")

      // Remove excessive commas
      .replace(/,+/g, ",")

      // Normalize spaces
      .replace(/[ ]{2,}/g, " ")

      // Limit multiple newlines
      .replace(/\n{3,}/g, "\n\n")

      .trim()
  );
}

export async function splitTextIntoChunks(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP,
): Promise<string[]> {
  const safeChunkSize = Math.max(200, chunkSize);
  const safeOverlap = Math.max(0, Math.min(overlap, safeChunkSize - 50));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: safeChunkSize,
    chunkOverlap: safeOverlap,
    separators: ["\n\n", "\n", ". ", " ", ""],
    lengthFunction: (value) => value.length,
  });

  const chunks = await splitter.splitText(text);
  return chunks.map((chunk) => chunk.trim()).filter(Boolean);
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY_NOT_CONFIGURED");
  }
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const embeddings: number[][] = []; // 2d array defined.
  const batchSize = 96;
  // 500 chunks hain toh:
  // Batch 1 → chunks 0-95    → OpenAI → embeddings
  // Batch 2 → chunks 96-191  → OpenAI → embeddings
  // Batch 3 → chunks 192-287 → OpenAI → embeddings
  // Batch 4 → chunks 288-383 → OpenAI → embeddings
  // Batch 5 → chunks 384-479 → OpenAI → embeddings
  // Batch 6 → chunks 480-499 → OpenAI → embeddings

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    const sorted = [...response.data]
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);

    sorted.forEach((embedding) => {
      if (embedding.length !== EMBEDDING_DIM) {
        throw new Error("EMBEDDING_DIM_MISMATCH");
      }
    });

    embeddings.push(...sorted);
  }

  return embeddings;
}

export function vectorToSql(vector: number[]): string {
  const safeValues = vector.map((value) =>
    Number.isFinite(value) ? value.toFixed(6) : "0",
  );
  return `[${safeValues.join(",")}]`;
}

export async function getRagContext(
  query: string,
  options?: { topK?: number; domains?: Domain[] },
): Promise<RagContextChunk[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const topK = options?.topK ?? DEFAULT_TOP_K;
  const domains = options?.domains ?? [];

  const [embedding] = await createEmbeddings([trimmedQuery]);
  if (!embedding) return [];

  const vector = vectorToSql(embedding);
  const domainClause =
    domains.length > 0
      ? Prisma.sql`WHERE rd."domains" && ARRAY[${Prisma.join(
          domains,
        )}]::"Domain"[]`
      : Prisma.empty;
  const rows = await prisma.$queryRaw<RagContextChunk[]>(
    Prisma.sql`
      SELECT
        rc."content",
        rd."sourceFileName",
        rc."documentId",
        rc."embedding" OPERATOR(extensions.<=>) ${vector}::extensions.vector AS "distance"
      FROM "RagChunk" rc
      JOIN "RagDocument" rd ON rd."id" = rc."documentId"
      ${domainClause}
      ORDER BY rc."embedding" OPERATOR(extensions.<=>) ${vector}::extensions.vector
      LIMIT ${topK};
    `,
  );

  return rows;
}

export function formatRagContext(chunks: RagContextChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map((chunk, index) => `[#${index + 1}] ${chunk.content}`)
    .join("\n\n");
}

export function buildRagQuery(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter((part) => part.length > 0)
    .join("\n");
}
