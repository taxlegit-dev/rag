import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// used in delete sop from user dashboard.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectSessionId = searchParams.get("sessionId");

    if (!projectSessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

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
        { status: 404 }
      );
    }

    const answers = await prisma.answer.findMany({
      where: {
        projectSessionId,
      },
      include: {
        question: true,
      },
    });

    return NextResponse.json({ answers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
