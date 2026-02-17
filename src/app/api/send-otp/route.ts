import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppOTPExact } from "@/lib/aisancy";

export async function POST(request: NextRequest) {
  try {
    const { phone, isSignup } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (typeof isSignup !== "boolean") {
      return NextResponse.json(
        { error: "isSignup flag is required" },
        { status: 400 }
      );
    }

    // Check user existence based on signup/login mode
    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });

    // Also check if this is a sub-user
    const existingSubUser = await prisma.subUser.findUnique({
      where: { contactNumber: phone },
    });

    if (isSignup && (existingUser || existingSubUser)) {
      return NextResponse.json(
        { error: "User already exists. Please login instead." },
        { status: 400 }
      );
    }

    if (!isSignup && !existingUser && !existingSubUser) {
      return NextResponse.json(
        { error: "User not found. Please signup first." },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to DB (overwrite any existing for this phone)
    await prisma.oTP.upsert({
      where: { phone },
      update: { otp, expiresAt },
      create: { phone, otp, expiresAt },
    });

    await sendWhatsAppOTPExact({ phone10: phone, otp, urlButtonParam: otp });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    //TODO: need to handle errors better
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
