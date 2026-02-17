import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
      userId,
    } = await req.json();

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { message: "Plan not found", success: false },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update user's plan in the database
      console.log("Updating user with userId:", userId, "and planId:", planId);
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: { connect: { id: planId } },
          remainingProcesses: { increment: plan.processLimit },
          remainingSubprocesses: { increment: plan.subprocessLimit },
        },
      });

      return NextResponse.json({
        message: "Payment successful",
        success: true,
      });
    } else {
      return NextResponse.json(
        { message: "Payment verification failed", success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
