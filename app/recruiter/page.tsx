"use client";
import React from "react";
import ContactUsForm from "@/components/ContactUsForm";
import JobPostingForm from "@/components/JobPostingForm";
import JobList from "@/components/JobList";
import withRecruiterAuth from "@/hooks/withRecruiterAuth";
import RecruiterNavbar from "@/components/RecruiterNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RecruiterHomePage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <RecruiterNavbar />
      <header className="bg-emerald-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Welcome, Recruiter!</h1>
          <p className="text-lg mt-2">Manage your job postings and connect with us.</p>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Welcome to your dashboard</h2>
          <p className="text-gray-600 mt-2">
            Use the navigation bar above to post new jobs, view your existing job postings, or get in touch with us.
          </p>
        </div>
      </main>
    </div>
  );
};

export default withRecruiterAuth(RecruiterHomePage);