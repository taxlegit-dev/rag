import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { planIdSchema, updatePlanSchema } from "@/lib/validations";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

/* ---------------------------------------------
   🧩 GET /api/plans/[id] - Fetch a single plan
---------------------------------------------- */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();

    const { id } = await context.params;

    const { id: validId } = planIdSchema.parse({ id });

    const plan = await prisma.plan.findUnique({
      where: { id: validId },
      select: {
        // ✅ ADD SELECT WITH DOWNLOAD FIELDS
        id: true,
        name: true,
        price: true,
        processLimit: true,
        subprocessLimit: true,
        description: true,
        ctaText: true,
        features: true,
        popular: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        isDefault: true,
        // ✅ ADD DOWNLOAD FIELDS
        canDownloadProcess: true,
        canDownloadRCM: true,
        canDownloadPDF: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);

    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });

    if (error instanceof Error) {
      if (error.message === "Unauthorized")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (error.message.includes("Admin access required"))
        return NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 }
        );
    }

    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------
   🧩 DELETE /api/plans/[id] - Remove a plan
---------------------------------------------- */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();
    const { id } = await context.params;
    const { id: validId } = planIdSchema.parse({ id });

    // Check existence
    const existingPlan = await prisma.plan.findUnique({
      where: { id: validId },
    });
    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Ensure plan isn't in use
    const usersWithPlan = await prisma.user.count({
      where: { planId: validId },
    });
    if (usersWithPlan > 0) {
      return NextResponse.json(
        { error: "Cannot delete a plan currently assigned to users" },
        { status: 400 }
      );
    }

    const subscriptionsCount = await prisma.subscription.count({
      where: { planId: validId },
    });
    if (subscriptionsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete a plan that has existing subscriptions" },
        { status: 400 }
      );
    }

    await prisma.plan.delete({ where: { id: validId } });

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);

    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });

    if (error instanceof Error) {
      if (error.message === "Unauthorized")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (error.message.includes("Admin access required"))
        return NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 }
        );
    }

    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------
   🧩 PUT /api/plans/[id] - Update a plan
---------------------------------------------- */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();

    const { id } = await context.params;
    const { id: validId } = planIdSchema.parse({ id });

    const body = await req.json();
    const data = updatePlanSchema.parse(body);

    const existingPlan = await prisma.plan.findUnique({
      where: { id: validId },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Check unique name
    if (data.name && data.name !== existingPlan.name) {
      const nameConflict = await prisma.plan.findUnique({
        where: { name: data.name },
      });
      if (nameConflict) {
        return NextResponse.json(
          { error: "A plan with this name already exists" },
          { status: 400 }
        );
      }
    }

    // If setting isDefault to true, unset other default plans
    if (data.isDefault) {
      await prisma.plan.updateMany({
        where: {
          isDefault: true,
          id: { not: validId },
        },
        data: { isDefault: false },
      });
    }

    // Only update provided fields
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const updatedPlan = await prisma.plan.update({
      where: { id: validId },
      data: updateData, // ✅ This will include download fields if provided
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating plan:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === "Unauthorized")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (error.message.includes("Admin access required"))
        return NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 }
        );
    }

    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
