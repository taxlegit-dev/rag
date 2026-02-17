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
  const lower = fileName.toLowerCase(); // "Report.PDF" → "report.pdf"
  const dot = lower.lastIndexOf("."); // finds position of the LAST dot (last dot hi extension hota hai)
  return dot >= 0 ? lower.slice(dot) : ""; // dot found → return ".pdf", no dot → return ""
}

async function extractTextFromFile(file: File): Promise<string> {
  const ext = getFileExtension(file.name);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  const arrayBuffer = await file.arrayBuffer();

  // mammoth returns object with .value
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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const text = formData.get("text");

    const manualText = typeof text === "string" ? text.trim() : "";
    // Agar text string hai → trim karke rakh lo
    // Agar null/undefined hai → empty string rakh lo

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
    //Yeh database mein ek naya document record bana raha hai — basically ek parent entry jo baad mein saare chunks ko track karne ke liye use hogi.
    const document = await prisma.ragDocument.create({
      data: {
        sourceFileName: sourceFileName || "Manual text",
        uploadedById: session.user.id,
      },
    });

    const embeddings = await createEmbeddings(chunks);

    // This is preparing multiple rows for bulk insert into RagChunk table.
    const values = embeddings.map((embedding, index) => {
      const vector = vectorToSql(embedding);
      const chunkId = randomUUID();
      return Prisma.sql`(
        ${chunkId},
        ${document.id},
        ${index},
        ${chunks[index]},
        ${vector}::vector
      )`;
    });

    // For ex: Tumne ek 10 page PDF upload ki
    //         ↓
    // 1 RagDocument record bana  → "report.pdf" ka parent folder
    //         ↓
    // PDF ke 50 chunks bane      → 50 RagChunk records
    //         ↓
    // Har chunk mein documentId = "uuid-123"  → sabko pata hai wo "report.pdf" ke hain

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
