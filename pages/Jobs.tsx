"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type Job = {
  id: number;
  title: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
};

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data?.jobs) setJobs(data.jobs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  async function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    const formEl = e.currentTarget as HTMLFormElement;
    const form = new FormData(formEl);
    form.append("jobId", String(selectedJob.id));

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data?.success) {
        setSuccessMessage("Application submitted successfully.");
        formEl.reset();
        setSelectedJob(null);
      } else {
        setSuccessMessage(data?.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      setSuccessMessage("Failed to submit application.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-24">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Available Jobs</h1>
          <p className="text-gray-600">Explore job opportunities</p>
        </div>

        {loading ? (
          <div>Loading jobs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id}>
                <Card className="h-full hover:shadow-lg shadow-emerald-50 transition-shadow border border-gray-100 hover:border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h2 className="font-bold text-xl mb-1">{job.title}</h2>
                        <p className="text-emerald-600 font-medium">Recruiter</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-600 line-clamp-2">{job.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link href={`/jobs/${job.id}`} className="px-3 py-2 rounded bg-slate-100 text-sm">
                        View
                      </Link>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
                            onClick={() => setSelectedJob(job)}
                          >
                            Apply
                          </button>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
                          <DialogDescription>
                            Fill your details and upload resume to apply.
                          </DialogDescription>

                          <form className="mt-4 space-y-3" onSubmit={handleApply}>
                            <div className="grid grid-cols-2 gap-2">
                              <input name="firstName" placeholder="First name" required className="border p-2 rounded" />
                              <input name="lastName" placeholder="Last name" required className="border p-2 rounded" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <input name="phone" placeholder="Phone" required className="border p-2 rounded" />
                              <input name="email" placeholder="Email" type="email" required className="border p-2 rounded" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <input name="dob" placeholder="Date of birth" type="date" className="border p-2 rounded" />
                              <select name="gender" className="border p-2 rounded">
                                <option value="">Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <textarea name="qualifications" placeholder="Qualifications" className="w-full border p-2 rounded" />

                            <input name="currentEmployment" placeholder="Current employment" className="w-full border p-2 rounded" />

                            <input name="certifications" placeholder="Certifications" className="w-full border p-2 rounded" />

                            <div className="grid grid-cols-2 gap-2">
                              <input name="linkedin" placeholder="LinkedIn URL" className="border p-2 rounded" />
                              <input name="github" placeholder="GitHub URL" className="border p-2 rounded" />
                            </div>

                            <textarea name="why" placeholder="Why should we hire you?" className="w-full border p-2 rounded" />

                            <div>
                              <label className="text-sm block mb-1">Resume (PDF/DOC)</label>
                              <input name="resume" type="file" accept=".pdf,.doc,.docx" className="w-full" />
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <DialogClose asChild>
                                <button type="button" className="px-3 py-2 rounded border">Cancel</button>
                              </DialogClose>
                              <button type="submit" disabled={submitting} className="px-3 py-2 rounded bg-emerald-600 text-white">
                                {submitting ? "Submitting..." : "Submit Application"}
                              </button>
                            </div>
                          </form>

                          {successMessage && <div className="mt-3 text-sm text-green-600">{successMessage}</div>}

                          <DialogClose />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
