"use client";
import React from "react";
import {
  LogIn,
  LayoutDashboard,
  Building2,
  FileText,
  CheckCircle,
} from "lucide-react";

const steps = [
  {
    icon: <LogIn className="w-6 h-6 text-purple-400" />,
    title: "Login or Sign Up",
    description:
      "Create your account or log in to access the ICFR and SOP generation platform.",
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-purple-400" />,
    title: "Go to SOP from Navbar",
    description:
      "Navigate to the SOP / ICFR section from the main navigation menu.",
  },
  {
    icon: <Building2 className="w-6 h-6 text-purple-400" />,
    title: "Enter Company Name",
    description:
      "Provide your company or process name to uniquely identify your ICFR documentation.",
  },
  {
    icon: <FileText className="w-6 h-6 text-purple-400" />,
    title: "Answer Basic Questions",
    description:
      "Answer a few simple business and compliance-related questions to tailor your ICFR.",
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-purple-400" />,
    title: "SOP Generated Step-by-Step",
    description:
      "Your ICFR SOP is automatically generated in a structured, auditor-ready format.",
  },
];

const ICFRSteps: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-black to-purple-700 text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="md:text-4xl text-xl font-semibold ">
            How to Generate Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              ICFR
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Follow these simple steps to generate your Internal Financial
            Controls and SOPs using our AI-powered platform.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center hover:border-purple-600 transition"
            >
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-800">
                {step.icon}
              </div>

              <h3 className="font-semibold text-lg mb-2">
                {index + 1}. {step.title}
              </h3>

              <p className="text-sm text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ICFRSteps;
