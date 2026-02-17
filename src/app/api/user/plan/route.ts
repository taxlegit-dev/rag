import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = (session.user.role || "").toLowerCase() === "admin";

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        plan: true, // Include the plan relation
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let plan = user.plan;

    // If user has no plan assigned, fallback to default plan
    if (!plan) {
      plan = await prisma.plan.findFirst({
        where: { isDefault: true },
      });
    }

    if (!plan) {
      return NextResponse.json(
        { error: "No plan found for user and no default plan available" },
        { status: 500 }
      );
    }

    // Calculate used counts
    const usedProcesses = await prisma.process.count({
      where: {
        projectSession: {
          userId: session.user.id,
        },
      },
    });

    const usedSubprocesses = await prisma.subprocess.count({
      where: {
        process: {
          projectSession: {
            userId: session.user.id,
          },
        },
      },
    });

    let remainingProcesses = isAdmin
      ? Number.MAX_SAFE_INTEGER
      : user.remainingProcesses ?? 0;
    let remainingSubprocesses = isAdmin
      ? Number.MAX_SAFE_INTEGER
      : user.remainingSubprocesses ?? 0;

    if (!isAdmin) {
      let shouldUpdateUser = false;

      const shouldBackfillProcesses =
        remainingProcesses === 0 &&
        usedProcesses === 0 &&
        plan.processLimit > 0;
      const shouldBackfillSubprocesses =
        remainingSubprocesses === 0 &&
        usedSubprocesses === 0 &&
        plan.subprocessLimit > 0;

      if (shouldBackfillProcesses) {
        remainingProcesses = plan.processLimit;
        shouldUpdateUser = true;
      }

      if (shouldBackfillSubprocesses) {
        remainingSubprocesses = plan.subprocessLimit;
        shouldUpdateUser = true;
      }

      remainingProcesses = Math.max(0, remainingProcesses);
      remainingSubprocesses = Math.max(0, remainingSubprocesses);

      if (shouldUpdateUser) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            remainingProcesses,
            remainingSubprocesses,
          },
        });
      }
    }
    const effectivePlan = isAdmin
      ? {
          ...plan,
          canDownloadProcess: true,
          canDownloadRCM: true,
          canDownloadPDF: true,
        }
      : plan;

    console.log("DEBUG API /api/user/plan:");
    console.log("User email:", session.user.email);
    console.log("User planId:", user.planId);
    console.log("User plan:", user.plan);
    console.log("Fallback plan:", plan);
    console.log("Used processes:", usedProcesses);
    console.log("Used subprocesses:", usedSubprocesses);
    console.log("Remaining processes:", remainingProcesses);
    console.log("Remaining subprocesses:", remainingSubprocesses);

    return NextResponse.json(
      {
        plan: effectivePlan,
        usedProcesses,
        usedSubprocesses,
        remainingProcesses,
        remainingSubprocesses,
        isAdmin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
