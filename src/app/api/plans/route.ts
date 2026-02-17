import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { createPlanSchema } from "@/lib/validations";

// ✅ Verify admin access
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

export async function GET() {
  try {
    let isAdmin = false;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (user && user.role === "ADMIN") {
          isAdmin = true;
        }
      }
    } catch (e) {
      // Ignore errors, treat as not admin
    }

    const plans = await prisma.plan.findMany({
      where: isAdmin ? {} : { isActive: true },
      select: {
        // ✅ Use select instead of include for specific fields
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
        _count: {
          select: {
            users: true,
            subscriptions: true,
          },
        },
      },
      orderBy: [{ isDefault: "desc" }, { price: "asc" }],
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();

    const json = await req.json();
    const data = createPlanSchema.parse(json);

    // Check if plan name already exists
    const existingPlan = await prisma.plan.findUnique({
      where: { name: data.name },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: "A plan with this name already exists" },
        { status: 400 }
      );
    }

    // ✅ COMPLETE PLAN DATA WITH DOWNLOAD FIELDS
    const planData = {
      name: data.name,
      description: data.description || null,
      price: data.price,
      processLimit: data.processLimit,
      subprocessLimit: data.subprocessLimit,
      isActive: data.isActive ?? true,
      popular: data.popular ?? false,
      isDefault: data.isDefault ?? false,
      ctaText: data.ctaText || null,
      features: data.features || [],
      // ✅ ADD DOWNLOAD FIELDS WITH DEFAULTS
      canDownloadProcess: data.canDownloadProcess ?? false,
      canDownloadRCM: data.canDownloadRCM ?? false,
      canDownloadPDF: data.canDownloadPDF ?? false,
    };

    // If setting as default plan, unset other default plans
    if (planData.isDefault) {
      await prisma.plan.updateMany({
        where: {
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const plan = await prisma.plan.create({
      data: planData,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
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
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
