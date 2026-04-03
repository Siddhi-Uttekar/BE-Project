
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Job } from "@/types"; // Assuming you have a types file

interface JobPostingFormProps {
  job?: Job;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ job }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [benefits, setBenefits] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDescription(job.description);
      setLocation(job.location);
      setAboutCompany(job.aboutCompany || "");
      setResponsibilities(job.responsibilities || "");
      setQualifications(job.qualifications || "");
      setBenefits(job.benefits || "");
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You must be logged in.");
        setIsLoading(false);
        return;
      }

      const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
      const method = job ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          aboutCompany,
          responsibilities,
          qualifications,
          benefits,
        }),
      });

      if (response.ok) {
        toast.success(`Job ${job ? "updated" : "posted"} successfully!`);
        if (!job) {
          setTitle("");
          setDescription("");
          setLocation("");
          setAboutCompany("");
          setResponsibilities("");
          setQualifications("");
          setBenefits("");
        }
      } else {
        toast.error(`Failed to ${job ? "update" : "post"} job.`);
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          placeholder="e.g., Software Engineer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g., San Francisco, CA"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="aboutCompany">About the Company</Label>
        <Textarea
          id="aboutCompany"
          placeholder="About the company..."
          value={aboutCompany}
          onChange={(e) => setAboutCompany(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">About the Position</Label>
        <Textarea
          id="description"
          placeholder="Job description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="responsibilities">Responsibilities</Label>
        <Textarea
          id="responsibilities"
          placeholder="What will the candidate be responsible for?"
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="qualifications">Qualifications</Label>
        <Textarea
          id="qualifications"
          placeholder="What qualifications are required?"
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="benefits">Benefits</Label>
        <Textarea
          id="benefits"
          placeholder="What benefits do you offer?"
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
        disabled={isLoading}
      >
        {isLoading ? "Posting..." : "Post Job"}
      </Button>
    </form>
  );
};

export default JobPostingForm;
