"use client";
import React from "react";
import Image from "next/image";

const features = [
  {
    title: "AI-Powered ICFR Generation in 2 Minutes",
    description:
      "Generate complete ICFR documentation and SOPs within minutes using our AI-driven workflow, eliminating manual drafting and errors.",
    image: "/images/features/step1.png", // replace
  },
  {
    title: "Create Employees & Assign Departments",
    description:
      "Add employees with custom roles and details. For example, create an employee profile for Neha Sharma as per your organization structure and assign thier department to them. Example: HR department assigned to Neha Sharma.",
    image: "/images/features/step2.png", // replace
  },
  {
    title: "Create Departments ",
    description: "Create departments such as HR, Finance, or Operations.",
    image: "/images/features/step3.png", // replace
  },
  {
    title: "Assign SOPs to Departments",
    description:
      "Assign department-specific SOPs to ensure accountability. Example: HR SOP assigned to Neha Sharma as the HR Manager.",
    image: "/images/features/step4.png", // replace
  },
  {
    title: "Employee Login & SOP Visibility",
    description:
      "Employees can log in with their credentials and view only the SOPs assigned to them, ensuring clarity, responsibility, and compliance.",
    image: "/images/features/step5.png", // replace
  },
];

const ICFRFeatures: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-purple-700 via-slate-950 to-black text-white py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xl md:text-4xl font-bold mb-4">
            Powerful Features Built for
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              ICFR Compliance
            </span>
          </h2>
          <p className="text-slate-300">
            Everything you need to generate, assign, and manage SOPs across
            departments with complete control and accountability.
          </p>
        </div>

        {/* Feature Blocks */}
        {features.map((feature, index) => (
          <div
            key={index}
            className={`grid gap-12 items-center md:grid-cols-2 ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Image */}
            <div
              className={`relative w-full h-[260px] md:h-[340px] rounded-2xl overflow-hidden  ${
                index % 2 === 1 ? "md:order-2" : ""
              }`}
            >
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-contain "
              />
            </div>

            {/* Content */}
            <div className={index % 2 === 1 ? "md:order-1" : ""}>
              <h3 className="text-2xl font-semibold mb-4">
                {index + 1}. {feature.title}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ICFRFeatures;
