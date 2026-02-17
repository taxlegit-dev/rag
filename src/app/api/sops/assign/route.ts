import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { process, subUserId } = await request.json();
    console.log("Assign SOP request received:", { process, subUserId });

    if (!process || !subUserId) {
      console.log("Missing required fields: process or subUserId");
      return NextResponse.json(
        { error: "Process and subUserId are required" },
        { status: 400 }
      );
    }

    // Find the sub-user
    console.log("Finding sub-user with ID:", subUserId);
    const subUser = await prisma.subUser.findUnique({
      where: { id: subUserId },
    });

    if (!subUser) {
      console.log("Sub-user not found for ID:", subUserId);
      return NextResponse.json(
        { error: "Sub-user not found" },
        { status: 404 }
      );
    }
    console.log("Sub-user found:", subUser.name);

    // Find all processes with the given name and their subprocesses
    console.log("Finding processes for process name:", process);
    const processes = await prisma.process.findMany({
      where: { name: process },
      include: {
        subprocesses: {
          include: {
            subUserAssignments: {
              include: { subUser: true },
            },
          },
        },
      },
    });

    // Flatten to get all subprocesses
    const subprocesses = processes.flatMap((p) => p.subprocesses);
    console.log("Found subprocesses count:", subprocesses.length);

    if (subprocesses.length === 0) {
      console.log("No subprocesses found for process:", process);
      return NextResponse.json(
        { error: "No subprocesses found for this process" },
        { status: 404 }
      );
    }

    // Update each subprocess to add the sub-user if not already assigned
    console.log("Starting assignment process for", subprocesses.length, "subprocesses");
    const updatePromises = subprocesses.map(async (subprocess) => {
      const isAlreadyAssigned = subprocess.subUserAssignments.some(
        (assignment) => assignment.subUserId === subUserId
      );
      console.log(`Subprocess ${subprocess.id} - Already assigned:`, isAlreadyAssigned);
      if (!isAlreadyAssigned) {
        console.log(
          `Creating assignment for subprocess ${subprocess.id} to sub-user ${subUserId}`
        );
        await prisma.subUserSOPAssignment.create({
          data: {
            subUserId,
            subprocessId: subprocess.id,
          },
        });
        console.log(`Assignment created for subprocess ${subprocess.id}`);
      } else {
        console.log(`Skipping assignment for subprocess ${subprocess.id} - already assigned`);
      }
    });

    await Promise.all(updatePromises);
    console.log("All assignments processed successfully");

    return NextResponse.json({ message: "Assignment successful" });
  } catch (error) {
    console.error("Error assigning SOP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { process, subUserId } = await request.json();
    console.log("Remove SOP assignment request received:", {
      process,
      subUserId,
    });

    if (!process || !subUserId) {
      console.log("Missing required fields: process or subUserId");
      return NextResponse.json(
        { error: "Process and subUserId are required" },
        { status: 400 }
      );
    }

    // Find all processes with the given name and their subprocesses
    console.log("Finding processes for process name:", process);
    const processes = await prisma.process.findMany({
      where: { name: process },
      include: {
        subprocesses: {
          include: {
            subUserAssignments: {
              include: { subUser: true },
            },
          },
        },
      },
    });

    // Flatten to get all subprocesses
    const subprocesses = processes.flatMap((p) => p.subprocesses);
    console.log("Found subprocesses count:", subprocesses.length);

    if (subprocesses.length === 0) {
      console.log("No subprocesses found for process:", process);
      return NextResponse.json(
        { error: "No subprocesses found for this process" },
        { status: 404 }
      );
    }

    // Remove assignments for each subprocess
    console.log("Starting removal process for", subprocesses.length, "subprocesses");
    const deletePromises = subprocesses.map(async (subprocess) => {
      const assignment = subprocess.subUserAssignments.find(
        (assignment) => assignment.subUserId === subUserId
      );
      if (assignment) {
        console.log(
          `Removing assignment for subprocess ${subprocess.id} from sub-user ${subUserId}`
        );
        await prisma.subUserSOPAssignment.delete({
          where: { id: assignment.id },
        });
        console.log(`Assignment removed for subprocess ${subprocess.id}`);
      } else {
        console.log(
          `No assignment found for subprocess ${subprocess.id} and sub-user ${subUserId}`
        );
      }
    });

    await Promise.all(deletePromises);
    console.log("All removals processed successfully");

    return NextResponse.json({ message: "Removal successful" });
  } catch (error) {
    console.error("Error removing SOP assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
