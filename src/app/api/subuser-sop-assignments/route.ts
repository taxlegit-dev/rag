import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subUserId = searchParams.get("subUserId");
    const subprocessId = searchParams.get("subprocessId");

    let assignments;

    if (subUserId) {
      // Get all subprocesses assigned to a specific sub-user
      if (session.user.role === "subuser") {
        // Sub-user fetching their own assignments
        if (subUserId !== session.user.subUserId) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        assignments = await prisma.subUserSOPAssignment.findMany({
          where: {
            subUserId,
          },
          include: {
            subprocess: {
              include: {
                process: {
                  include: {
                    projectSession: true,
                  },
                },
              },
            },
          },
        });
      } else {
        // Main user fetching assignments for their sub-user
        assignments = await prisma.subUserSOPAssignment.findMany({
          where: {
            subUserId,
            subUser: {
              userId: session.user.id, // Ensure sub-user belongs to current user
            },
          },
          include: {
            subprocess: {
              include: {
                process: {
                  include: {
                    projectSession: true,
                  },
                },
              },
            },
          },
        });
      }
    } else if (subprocessId) {
      // Get all sub-users assigned to a specific subprocess
      assignments = await prisma.subUserSOPAssignment.findMany({
        where: {
          subprocessId,
          subprocess: {
            process: {
              projectSession: {
                userId: session.user.id, // Ensure subprocess belongs to current user
              },
            },
          },
        },
        include: {
          subUser: {
            include: {
              department: true,
            },
          },
        },
      });
    } else {
      // Get all assignments for the current user
      assignments = await prisma.subUserSOPAssignment.findMany({
        where: {
          subUser: {
            userId: session.user.id,
          },
        },
        include: {
          subUser: {
            include: {
              department: true,
            },
          },
          subprocess: {
            include: {
              process: {
                include: {
                  projectSession: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subUserId, subprocessId } = await request.json();

    if (!subUserId || !subprocessId) {
      return NextResponse.json(
        { error: "subUserId and subprocessId are required" },
        { status: 400 }
      );
    }

    // Verify that the sub-user belongs to the current user
    const subUser = await prisma.subUser.findFirst({
      where: {
        id: subUserId,
        userId: session.user.id,
      },
    });

    if (!subUser) {
      return NextResponse.json(
        { error: "Sub-user not found or access denied" },
        { status: 404 }
      );
    }

    // Verify that the subprocess belongs to the current user
    const subprocess = await prisma.subprocess.findFirst({
      where: {
        id: subprocessId,
        process: {
          projectSession: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!subprocess) {
      return NextResponse.json(
        { error: "Subprocess not found or access denied" },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.subUserSOPAssignment.findUnique({
      where: {
        subUserId_subprocessId: {
          subUserId,
          subprocessId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Assignment already exists" },
        { status: 409 }
      );
    }

    // Create the assignment
    const assignment = await prisma.subUserSOPAssignment.create({
      data: {
        subUserId,
        subprocessId,
      },
      include: {
        subUser: {
          include: {
            department: true,
          },
        },
        subprocess: {
          include: {
            process: {
              include: {
                projectSession: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subUserId = searchParams.get("subUserId");
    const subprocessId = searchParams.get("subprocessId");

    if (!subUserId || !subprocessId) {
      return NextResponse.json(
        { error: "subUserId and subprocessId are required" },
        { status: 400 }
      );
    }

    // Verify ownership and delete
    const assignment = await prisma.subUserSOPAssignment.findFirst({
      where: {
        subUserId,
        subprocessId,
        subUser: {
          userId: session.user.id,
        },
        subprocess: {
          process: {
            projectSession: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.subUserSOPAssignment.delete({
      where: {
        id: assignment.id,
      },
    });

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
