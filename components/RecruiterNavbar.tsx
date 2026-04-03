
"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/userUser";
import { useRouter } from "next/navigation";

const RecruiterNavbar = () => {
  const { logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/recruiter" className="text-2xl font-bold text-emerald-600">
            MockHire
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/recruiter/contact-us" className="text-gray-600 hover:text-emerald-600">
              Contact Us
            </Link>
            <Link href="/recruiter/post-job" className="text-gray-600 hover:text-emerald-600">
              Post a Job
            </Link>
            <Link href="/recruiter/view-jobs" className="text-gray-600 hover:text-emerald-600">
              View Job Postings
            </Link>
            <Link href="/recruiter/applications" className="text-gray-600 hover:text-emerald-600">
              Applications
            </Link>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RecruiterNavbar;
