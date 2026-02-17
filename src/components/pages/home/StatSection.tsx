import React from "react";
import { Zap, Percent, Briefcase, Clock } from "lucide-react";

interface StatItem {
  number: string;
  label: string;
  suffix?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function StatsSection() {
  const stats: StatItem[] = [
    { number: "10", suffix: "x", label: "Faster SOP Creation", Icon: Zap },
    { number: "100", suffix: "%", label: "Customized Output", Icon: Percent },
    { number: "50", suffix: "+", label: "Business Processes", Icon: Briefcase },
    { number: "24/7", label: "Access Anytime", Icon: Clock },
  ];

  return (
    <section className="relative z-10 bg-black text-white py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="md:text-4xl text-xl font-semibold ">
            Optimize SOPs —
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              faster, smarter
            </span>
          </h2>
          <p className="text-gray-400 mt-2">
            Turn processes into playbooks. Generate, edit and assign SOPs in
            minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.Icon!;
            return (
              <div
                key={idx}
                className="group bg-black/60 border border-gray-600 rounded-2xl p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(139,92,246,0.12)]"
                aria-labelledby={`stat-${idx}-label`}
              >
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-700 via-pink-600 to-indigo-500 shadow-md">
                  <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                </div>

                <div className="flex items-baseline">
                  <span className="text-4xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    {stat.number}
                  </span>
                  {stat.suffix && (
                    <span className="ml-1 text-lg text-gray-300">
                      {stat.suffix}
                    </span>
                  )}
                </div>

                <div
                  id={`stat-${idx}-label`}
                  className="mt-2 text-sm sm:text-base text-gray-300 font-medium"
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 15a2 2 0 0 1-2 2h-1l-3 3v-3H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6l3 3V7h1a2 2 0 0 1 2 2v6z"
              />
            </svg>
            Get a demo
          </a>
        </div>
      </div>
    </section>
  );
}
