export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildRagQuery,
  cleanText,
  createEmbeddings,
  splitTextIntoChunks,
  vectorToSql,
} from "@/lib/rag";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const SUPPORTED_EXTENSIONS = new Set([
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
]);

function getFileExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  const dot = lower.lastIndexOf(".");
  return dot >= 0 ? lower.slice(dot) : "";
}

async function extractTextFromFile(file: File): Promise<string> {
  const ext = getFileExtension(file.name);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  const arrayBuffer = await file.arrayBuffer();

  if (ext === ".doc" || ext === ".docx") {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(arrayBuffer),
    });
    return result.value || "";
  }

  if (ext === ".xls" || ext === ".xlsx") {
    const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: "buffer" });
    const sheets = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      return XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    });
    return sheets.join("\n");
  }

  return Buffer.from(arrayBuffer).toString("utf8");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== "admin@taxlegit.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const text = formData.get("text");

    const manualText = typeof text === "string" ? text.trim() : "";

    let fileText = "";
    let sourceFileName: string | null = null;

    if (file instanceof File && file.size > 0) {
      sourceFileName = file.name;
      fileText = await extractTextFromFile(file);
    }

    const combinedText = buildRagQuery([fileText, manualText]);
    if (!combinedText) {
      return NextResponse.json(
        { error: "Text or file content is required" },
        { status: 400 },
      );
    }

    const chunks = await splitTextIntoChunks(cleanText(combinedText));

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No valid content found" },
        { status: 400 },
      );
    }

    const document = await prisma.ragDocument.create({
      data: {
        sourceFileName: sourceFileName || "Manual text",
        uploadedByEmail: session.user.email!,
      },
    });

    const embeddings = await createEmbeddings(chunks);

    const values = embeddings.map((embedding, index) => {
      const vector = vectorToSql(embedding);
      const chunkId = randomUUID();
      return Prisma.sql`(
        ${chunkId},
        ${document.id},
        ${index},
        ${chunks[index]},
        ${vector}::extensions.vector
      )`;
    });

    if (values.length > 0) {
      await prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO "RagChunk" ("id", "documentId", "chunkIndex", "content", "embedding")
          VALUES ${Prisma.join(values)};
        `,
      );
    }

    return NextResponse.json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("RAG upload failed:", error);
    const message =
      error instanceof Error && error.message === "UNSUPPORTED_FILE_TYPE"
        ? "Unsupported file type. Use DOC/DOCX/XLS/XLSX/TXT."
        : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
