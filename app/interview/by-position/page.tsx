"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const roles = [
  "Full Stack Developer",
  "Data Scientist",
  "Project Manager",
  "Software Engineer",
  "Product Manager",
  "Financial Analyst",
  "Web Designer",
  "Cybersecurity Analyst",
  "Sales Executive",
  "Marketing Manager",
  "Customer Service Representative",
  "Digital Marketing Specialist",
  "Business Analyst",
  "Account Manager",
  "Data Analyst",
];

const roleDetails: { [key: string]: { types: string[] } } = {
  "Software Engineer": {
    types: [
      "Behavioral Round",
      "Technical Round",
      "System Design",
      "Coding Round (Optional)",
    ],
  },
  "Full Stack Developer": {
    types: [
      "Behavioral Round",
      "Technical Round",
      "System Design",
      "Coding Round (Optional)",
    ],
  },
  "Data Scientist": {
    types: [
      "Behavioral Round",
      "Technical Round",
      "Statistics",
      "Machine Learning",
      "Coding Round (Optional)",
    ],
  },
  "Data Analyst": {
    types: [
      "Behavioral Round",
      "Technical Round",
      "Case Study",
      "Coding Round (Optional)",
    ],
  },
  "Project Manager": {
    types: ["Behavioral Round", "Situational", "Scenario Based"],
  },
  "Product Manager": {
    types: [
      "Behavioral Round",
      "Product Sense",
      "Scenario Based",
      "Case Study",
    ],
  },
  "Financial Analyst": {
    types: ["Behavioral Round", "Technical Round", "Case Study"],
  },
  "Web Designer": {
    types: ["Behavioral Round", "Technical Round", "Portfolio Review"],
  },
  "Cybersecurity Analyst": {
    types: ["Behavioral Round", "Technical Round", "Scenario Based"],
  },
  "Sales Executive": {
    types: ["Behavioral Round", "Role-play", "Scenario Based"],
  },
  "Marketing Manager": {
    types: ["Behavioral Round", "Strategic", "Scenario Based", "Case Study"],
  },
  "Customer Service Representative": {
    types: ["Behavioral Round", "Situational", "Scenario Based"],
  },
  "Digital Marketing Specialist": {
    types: ["Behavioral Round", "Technical Round", "Case Study"],
  },
  "Business Analyst": {
    types: [
      "Behavioral Round",
      "Case Study",
      "Technical Round",
      "Scenario Based",
    ],
  },
  "Account Manager": {
    types: ["Behavioral Round", "Role-play", "Scenario Based"],
  },
  default: { types: ["Behavioral Round", "Technical Round"] },
};

const ByPositionPage = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(5);

  const handleStartInterview = () => {
    router.push(
      `/interview/by-position/interview?role=${selectedRole}&level=${selectedLevel}&type=${selectedType}&duration=${selectedDuration}`
    );
    setIsModalOpen(false);
  };

  const handleRoleClick = (role: string) => {
    setSelectedRole(role);
    // Reset selections when a new role is clicked
    setSelectedLevel("Beginner");
    setSelectedType((roleDetails[role] || roleDetails.default).types[0]);
    setSelectedDuration(1);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50/50 to-white">
      {/* Hero Header Section */}
      <div className="bg-hero-gradient border-b border-emerald-100">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Interview Practice
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Practice by <span className="gradient-text">Position</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Select your target role and get a tailored interview experience
              with AI-powered questions and real-time feedback.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-gray-700">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">{roles.length}+ Roles</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Target className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Industry Specific</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Real-time Feedback</span>
              </div>
            </div>

            {/* Navigation Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-emerald-600 transition">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-emerald-600 font-medium">
                Interview by Position
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
              Choose Your Role
            </h2>
            <p className="text-center text-gray-600">
              Click on any position to customize your interview experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {roles.map((role, index) => (
              <Card
                key={index}
                className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white overflow-hidden"
                onClick={() => handleRoleClick(role)}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Briefcase className="w-6 h-6 text-emerald-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-emerald-700 transition-colors">
                    {role}
                  </h3>

                  <div className="flex flex-wrap gap-1">
                    {(roleDetails[role] || roleDetails.default).types
                      .slice(0, 2)
                      .map((type, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          {type}
                        </Badge>
                      ))}
                    {(roleDetails[role] || roleDetails.default).types.length >
                      2 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-600"
                      >
                        +
                        {(roleDetails[role] || roleDetails.default).types
                          .length - 2}{" "}
                        more
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {isModalOpen && selectedRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedRole}</h2>
                  <p className="text-emerald-100 text-sm">
                    Customize your interview experience
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Interview Level */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-lg text-gray-800">
                    Experience Level
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`p-4 border-2 rounded-xl hover:border-emerald-400 transition-all ${
                      selectedLevel === "Beginner"
                        ? "bg-emerald-50 border-emerald-500 shadow-md"
                        : "border-gray-200 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedLevel("Beginner")}
                  >
                    <div className="font-semibold text-gray-800 mb-1">
                      Beginner
                    </div>
                    <div className="text-xs text-gray-600">
                      Entry level questions
                    </div>
                  </button>
                  <button
                    className={`p-4 border-2 rounded-xl hover:border-emerald-400 transition-all ${
                      selectedLevel === "Professional"
                        ? "bg-emerald-50 border-emerald-500 shadow-md"
                        : "border-gray-200 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedLevel("Professional")}
                  >
                    <div className="font-semibold text-gray-800 mb-1">
                      Professional
                    </div>
                    <div className="text-xs text-gray-600">
                      Advanced scenarios
                    </div>
                  </button>
                </div>
              </div>

              {/* Interview Type */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-lg text-gray-800">
                    Interview Type
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(roleDetails[selectedRole] || roleDetails.default).types.map(
                    (type) => (
                      <button
                        key={type}
                        className={`p-3 border-2 rounded-xl hover:border-emerald-400 transition-all text-sm font-medium ${
                          selectedType === type
                            ? "bg-emerald-50 border-emerald-500 shadow-md text-emerald-700"
                            : "border-gray-200 hover:shadow-md text-gray-700"
                        }`}
                        onClick={() => setSelectedType(type)}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Interview Duration */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-lg text-gray-800">
                    Duration
                  </h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 5, 15, 30].map((duration) => (
                    <button
                      key={duration}
                      className={`p-4 border-2 rounded-xl hover:border-emerald-400 transition-all ${
                        selectedDuration === duration
                          ? "bg-emerald-50 border-emerald-500 shadow-md"
                          : "border-gray-200 hover:shadow-md"
                      }`}
                      onClick={() => setSelectedDuration(duration)}
                    >
                      <div className="font-bold text-xl text-gray-800">
                        {duration}
                      </div>
                      <div className="text-xs text-gray-600">min</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartInterview}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
                >
                  Start Interview
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ByPositionPage;
