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
    if (!session?.user || session.user.role === "subuser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify sub-user belongs to user
    const subUser = await prisma.subUser.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!subUser) {
      return NextResponse.json(
        { error: "Sub-user not found" },
        { status: 404 }
      );
    }

    await prisma.subUser.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Sub-user deleted successfully" });
  } catch (error) {
    console.error("Error deleting sub-user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
