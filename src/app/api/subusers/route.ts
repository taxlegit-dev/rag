import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sub-users cannot access this endpoint
    if (session.user.role === "subuser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subUsers = await prisma.subUser.findMany({
      where: { userId: session.user.id },
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subUsers);
  } catch (error) {
    console.error("Error fetching sub-users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role === "subuser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, contactNumber, departmentId } = await request.json();
    if (!name?.trim() || !contactNumber?.trim() || !departmentId) {
      return NextResponse.json(
        { error: "Name, contact number, and department are required" },
        { status: 400 }
      );
    }

    // Verify department belongs to user
    const department = await prisma.department.findFirst({
      where: { id: departmentId, userId: session.user.id },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Check if contact number is already used
    const existingSubUser = await prisma.subUser.findUnique({
      where: { contactNumber: contactNumber.trim() },
    });

    if (existingSubUser) {
      return NextResponse.json(
        { error: "Contact number already in use" },
        { status: 400 }
      );
    }

    const subUser = await prisma.subUser.create({
      data: {
        name: name.trim(),
        contactNumber: contactNumber.trim(),
        departmentId,
        userId: session.user.id,
      },
      include: { department: true },
    });

    return NextResponse.json(subUser, { status: 201 });
  } catch (error) {
    console.error("Error creating sub-user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role === "subuser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, contactNumber, departmentId } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Sub-user ID is required" },
        { status: 400 }
      );
    }

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

    // Prepare update data
    const updateData: Partial<{
      name: string;
      contactNumber: string;
      departmentId: string;
    }> = {};

    if (name?.trim()) {
      updateData.name = name.trim();
    }

    if (contactNumber?.trim()) {
      // Check if contact number is already used by another sub-user
      const existingSubUser = await prisma.subUser.findFirst({
        where: {
          contactNumber: contactNumber.trim(),
          id: { not: id }, // Exclude current sub-user
        },
      });

      if (existingSubUser) {
        return NextResponse.json(
          { error: "Contact number already in use" },
          { status: 400 }
        );
      }
      updateData.contactNumber = contactNumber.trim();
    }

    if (departmentId) {
      // Verify new department belongs to user
      const department = await prisma.department.findFirst({
        where: { id: departmentId, userId: session.user.id },
      });

      if (!department) {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      }
      updateData.departmentId = departmentId;
    }

    const updatedSubUser = await prisma.subUser.update({
      where: { id },
      data: updateData,
      include: { department: true },
    });

    return NextResponse.json(updatedSubUser);
  } catch (error) {
    console.error("Error updating sub-user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
