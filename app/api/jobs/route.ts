import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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

    if (!title || !description || !location) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const job = await prisma.jobs.create({
      data: {
        title,
        description,
        location,
        aboutCompany,
        responsibilities,
        qualifications,
        benefits,
        authorId: user.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    // If recruiter is authenticated, return only their job postings
    if (user && user.role === "RECRUITER") {
      const jobs = await prisma.jobs.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, jobs });
    }

    // Public/candidate view: return all job postings
    const jobs = await prisma.jobs.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Job fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
