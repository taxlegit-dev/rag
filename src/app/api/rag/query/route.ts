import { NextRequest, NextResponse } from "next/server";
import { Domain } from "@prisma/client";
import { getRagContext } from "@/lib/rag";

const DOMAIN_VALUES = [
  "ICFR",
  "AARAMBH",
  "NGO",
  "TAXLEGIT",
  "CSR",
  "DASHBOARD",
] as const;

function corsify(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return corsify(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const topK = Number.isFinite(body?.topK) ? Number(body.topK) : undefined;
    const domainsInput = Array.isArray(body?.domains) ? body.domains : [];

    if (!query) {
      return corsify(
        NextResponse.json({ error: "Query is required" }, { status: 400 }),
      );
    }

    const normalizedDomains = domainsInput
      .map((value: unknown) => (typeof value === "string" ? value.trim() : ""))
      .filter((value: string) => value.length > 0);

    const invalidDomains = normalizedDomains.filter(
      (value: string) =>
        !DOMAIN_VALUES.includes(value as (typeof DOMAIN_VALUES)[number]),
    );

    if (invalidDomains.length > 0) {
      return corsify(
        NextResponse.json({ error: "Invalid domain selection" }, { status: 400 }),
      );
    }

    const chunks = await getRagContext(query, {
      topK,
      domains: normalizedDomains as Domain[],
    });

    return corsify(NextResponse.json({ chunks }));
  } catch (error) {
    console.error("RAG query failed:", error);
    return corsify(
      NextResponse.json({ error: "Query failed" }, { status: 500 }),
    );
  }
}
