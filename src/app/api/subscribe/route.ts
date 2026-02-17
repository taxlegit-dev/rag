import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { planId } = await req.json();
  const userId = "mock-user-id"; // replace with real session.user.id

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  // Create a subscription entry
  await prisma.subscription.create({
    data: {
      userId,
      planId,
      paymentStatus: "SUCCESS",
      amountPaid: plan.price,
    },
  });

  // Update user's current plan
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: {
  //     planId,
  //     expiresAt: new Date(Date.now() + plan.durationDays * 86400000),
  //   },
  // });

  return NextResponse.json({ message: "Subscribed successfully!" });
}
