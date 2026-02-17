import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sessionId = id;

    // Verify the session belongs to the user
    const projectSession = await prisma.projectSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!projectSession) {
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the session (this will cascade delete answers and SOPs due to Prisma relations)
    await prisma.projectSession.delete({
      where: {
        id: sessionId,
      },
    });

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
