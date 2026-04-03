import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";

export async function POST(request: Request) {
  try {
    // try to determine user from cookies or auth header
    const user = await getCurrentUserFromRequest(request as any);
    const contentType = request.headers.get("content-type") || "";
    // Expect multipart/form-data from the client
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ success: false, message: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await request.formData();

    const jobId = form.get("jobId")?.toString() || null;
    const firstName = form.get("firstName")?.toString() || "";
    const lastName = form.get("lastName")?.toString() || "";
    const phone = form.get("phone")?.toString() || "";
    const email = form.get("email")?.toString() || "";
    const dob = form.get("dob")?.toString() || "";
    const gender = form.get("gender")?.toString() || "";
    const qualifications = form.get("qualifications")?.toString() || "";
    const currentEmployment = form.get("currentEmployment")?.toString() || "";
    const certifications = form.get("certifications")?.toString() || "";
    const linkedin = form.get("linkedin")?.toString() || "";
    const github = form.get("github")?.toString() || "";
    const why = form.get("why")?.toString() || "";

    const resume = form.get("resume") as File | null;

    let resumeUrl: string | null = null;

    if (resume && resume instanceof Blob) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${Date.now()}_${(resume as any).name || "resume.pdf"}`;
      const filePath = path.join(uploadsDir, filename);

      const arrayBuffer = await (resume as any).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      resumeUrl = `/uploads/${filename}`;
    }

    // Persist application to a local JSON file so we don't require a DB migration.
    const appsFile = path.join(process.cwd(), "data", "applications.json");
    let apps: any[] = [];
    try {
      if (fs.existsSync(appsFile)) {
        const raw = fs.readFileSync(appsFile, "utf8");
        apps = JSON.parse(raw || "[]");
      }
    } catch (e) {
      apps = [];
    }

    const application = {
      id: `app_${Date.now()}`,
      jobId,
      applicantId: user?.id || null,
      firstName,
      lastName,
      phone,
      email,
      dob,
      gender,
      qualifications,
      currentEmployment,
      certifications,
      linkedin,
      github,
      why,
      resumeUrl,
      status: "submitted",
      createdAt: new Date().toISOString(),
    };

    apps.push(application);
    fs.writeFileSync(appsFile, JSON.stringify(apps, null, 2), "utf8");

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json({ success: false, message: (error as any)?.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromRequest(request as any);

    const appsFile = path.join(process.cwd(), "data", "applications.json");
    let apps: any[] = [];
    try {
      if (fs.existsSync(appsFile)) {
        const raw = fs.readFileSync(appsFile, "utf8");
        apps = JSON.parse(raw || "[]");
      }
    } catch (e) {
      apps = [];
    }

    // Enrich apps with job info
    const enriched = await Promise.all(
      apps.map(async (a) => {
        const job = a.jobId ? await prisma.jobs.findUnique({ where: { id: parseInt(a.jobId) } }) : null;
        return { ...a, job };
      })
    );

    if (user?.role === "RECRUITER") {
      // return applications for recruiter's jobs
      const filtered = enriched.filter((a) => a.job?.authorId === user.id);
      return NextResponse.json({ success: true, applications: filtered });
    }

    if (user) {
      // candidate: return their applications by applicantId or matching email
      const filtered = enriched.filter((a) => a.applicantId === user.id || a.email === user.email);
      return NextResponse.json({ success: true, applications: filtered });
    }

    // unauthenticated: deny
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json({ success: false, message: (error as any)?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUserFromRequest(request as any);

    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body || {};

    if (!id || !status) {
      return NextResponse.json({ success: false, message: "Missing id or status" }, { status: 400 });
    }

    const appsFile = path.join(process.cwd(), "data", "applications.json");
    let apps: any[] = [];
    try {
      if (fs.existsSync(appsFile)) {
        const raw = fs.readFileSync(appsFile, "utf8");
        apps = JSON.parse(raw || "[]");
      }
    } catch (e) {
      apps = [];
    }

    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 });
    }

    const app = apps[idx];

    // verify recruiter owns the job
    const job = app.jobId ? await prisma.jobs.findUnique({ where: { id: parseInt(app.jobId) } }) : null;
    if (!job || job.authorId !== user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    apps[idx] = { ...app, status, updatedAt: new Date().toISOString() };
    fs.writeFileSync(appsFile, JSON.stringify(apps, null, 2), "utf8");

    return NextResponse.json({ success: true, application: apps[idx] });
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json({ success: false, message: (error as any)?.message || "Internal server error" }, { status: 500 });
  }
}
