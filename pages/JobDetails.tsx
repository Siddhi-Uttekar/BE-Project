"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { redirect, useParams } from "next/navigation";
import Link from "next/link";
const JobDetails = () => {
  const params = useParams();
  const id = params?.id as string;

  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      redirect("/jobs");
      return;
    }

    async function fetchJob() {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (data?.success && data.job) {
          setJob(data.job);
        } else {
          setJob(null);
        }
      } catch (err) {
        console.error(err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Interview button removed — page displays job information only.

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-24">
        <Link
          href="/jobs"
          className="text-emerald-600 hover:underline flex items-center mb-6 space-x-2"
        >
          <span className="mr-0.5">←</span> Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8 border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">{job.aboutCompany || job.company || "Recruiter"}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                        </div>
                  </div>
                  <div className="bg-gray-100 w-16 h-16 rounded-md flex items-center justify-center text-xl">
                    {(job.aboutCompany || job.company || job.title || " ").substring(0, 2)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">
                    {job.type || "Full-time"}
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                    {job.level || "Mid"}
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                    {job.industry || ""}
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Job Description</h2>
                  <p className="text-gray-700">{job.description}</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Requirements</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {(function getItems(field: any) {
                      if (Array.isArray(field)) return field;
                      if (!field) return [];
                      try {
                        const parsed = JSON.parse(field);
                        if (Array.isArray(parsed)) return parsed;
                      } catch (e) {}
                      return String(field).split(/\n|\.|;|-\s/).map((s) => s.trim()).filter(Boolean);
                    })(job.qualifications || job.requirements).map((requirement: any, index: number) => (
                      <li key={index} className="text-gray-700">
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Responsibilities</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {(function getResp(field: any) {
                      if (Array.isArray(field)) return field;
                      if (!field) return [];
                      try {
                        const parsed = JSON.parse(field);
                        if (Array.isArray(parsed)) return parsed;
                      } catch (e) {}
                      return String(field).split(/\n|\.|;|-\s/).map((s) => s.trim()).filter(Boolean);
                    })(job.responsibilities).map((responsibility: any, index: number) => (
                      <li key={index} className="text-gray-700">
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border border-gray-200 bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Job Summary</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-600">Company</p>
                    <p className="font-medium">{job.aboutCompany || job.company || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Job Type</p>
                    <p className="font-medium">{job.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Experience Level</p>
                    <p className="font-medium">{job.level}</p>
                  </div>
                  {job.salary && (
                    <div>
                      <p className="text-gray-600">Salary Range</p>
                      <p className="font-medium">{job.salary}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Posted Date</p>
                    <p className="font-medium">
                      {new Date(job.posted || job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Interview action removed - details only */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
