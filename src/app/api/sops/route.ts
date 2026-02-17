import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// for retrive sop for delete from user dashboard
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

    // Fetch processes with their subprocesses
    const processes = await prisma.process.findMany({
      where: {
        projectSessionId,
      },
      include: {
        subprocesses: {
          include: {
            subUserAssignments: {
              include: {
                subUser: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transform to match the old SOP format for backward compatibility
    const sops = processes.flatMap((process) =>
      process.subprocesses.map((subprocess) => ({
        id: subprocess.id,
        process: process.name,
        subprocess: subprocess.name,
        tasks: subprocess.tasks,
        createdAt: subprocess.createdAt,
        assignedSubUsers: subprocess.subUserAssignments.map((a) => a.subUser),
        subUserAssignments: subprocess.subUserAssignments,
      }))
    );

    return NextResponse.json({ sops });
  } catch (error) {
    console.error("Error fetching SOPs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
