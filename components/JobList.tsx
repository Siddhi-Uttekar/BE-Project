
"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  aboutCompany?: string;
  responsibilities?: string;
  qualifications?: string;
  benefits?: string;
  createdAt: string;
}

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You must be logged in to view jobs.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      } else {
        toast.error("Failed to fetch jobs.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching jobs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          toast.success("Job deleted successfully");
          fetchJobs(); // Refresh the job list
        } else {
          toast.error("Failed to delete job.");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the job.");
      }
    }
  };

  if (isLoading) {
    return <p>Loading jobs...</p>;
  }

  return (
    <div>
      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>{job.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Posted {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/recruiter/edit-job/${job.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-5 w-5 text-blue-500" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Location:</strong> {job.location}
                </p>
                {job.aboutCompany && (
                  <div className="mt-4">
                    <h3 className="font-semibold">About the Company</h3>
                    <p>{job.aboutCompany}</p>
                  </div>
                )}
                <div className="mt-4">
                  <h3 className="font-semibold">About the Position</h3>
                  <p>{job.description}</p>
                </div>
                {job.responsibilities && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Responsibilities</h3>
                    <p>{job.responsibilities}</p>
                  </div>
                )}
                {job.qualifications && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Qualifications</h3>
                    <p>{job.qualifications}</p>
                  </div>
                )}
                {job.benefits && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Benefits</h3>
                    <p>{job.benefits}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
