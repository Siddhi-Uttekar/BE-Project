import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Allow public access to job details. If a user is present, we'll
    // enforce recruiter-only access for editing/deleting elsewhere.
    const user = await getCurrentUserFromRequest(request);

    const job = await prisma.jobs.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    // If a recruiter is requesting, ensure they own the job; otherwise
    // allow public access to view job details.
    if (user && user.role === "RECRUITER" && job.authorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Job fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const job = await prisma.jobs.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!job || job.authorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Job not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.jobs.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Job deletion error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const job = await prisma.jobs.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!job || job.authorId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Job not found or unauthorized" },
        { status: 404 }
      );
    }

    const {
      title,
      description,
      location,
      aboutCompany,
      responsibilities,
      qualifications,
      benefits,
    } = await request.json();

    const updatedJob = await prisma.jobs.update({
      where: { id: parseInt(params.id) },
      data: {
        title,
        description,
        location,
        aboutCompany,
        responsibilities,
        qualifications,
        benefits,
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
