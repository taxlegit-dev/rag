import React from "react";

const TermsAndConditionsPage: React.FC = () => {
  return (
    <>
      <section className="relative h-[300px] w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-600/20 blur-3xl rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>

          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            Please read these terms carefully before using the ICFR Generation
            AI platform by TaxLegit Consulting Private Limited.
          </p>
          <p className="text-sm text-white py-4 underline">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>
      <section className="min-h-screen bg-slate-950 text-slate-200 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Section */}
          <div className="space-y-10">
            {/* Acceptance of Terms */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed text-slate-300">
                By accessing or using the ICFR Generation AI software (the
                <span className="text-white font-medium">
                  {" "}
                  &quot;Service&quot;
                </span>
                ), you agree to be bound by these Terms and Conditions. This
                agreement is entered into between
                <span className="text-white font-medium">
                  {" "}
                  TaxLegit Consulting Private Limited
                </span>{" "}
                (the <span className="italic">&quot;Company&quot;</span>,{" "}
                <span>&quot;we&quot;</span>, <span>&quot;us&quot;</span>, or{" "}
                <span>&quot;our&quot;</span>) and the entity or individual using
                the Service (the <span>&quot;User&quot;</span>,{" "}
                <span>&quot;you&quot;</span>, or <span>&quot;your&quot;</span>).
              </p>

              <p className="mt-3 leading-relaxed text-slate-300">
                If you do not agree to these Terms, you must discontinue use of
                the Service immediately.
              </p>
            </div>

            {/* Scope of AI Service */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                2. Scope of AI Service
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  <span className="text-white font-medium">Purpose:</span> The
                  Service uses artificial intelligence to assist in documenting,
                  testing, and generating ICFR frameworks.
                </li>
                <li>
                  <span className="text-white font-medium">
                    Not Professional Advice:
                  </span>{" "}
                  While the AI provides high-quality outputs, it does not
                  constitute formal audit opinions or legal advice. The User
                  remains responsible for the final accuracy and compliance of
                  all financial reporting.
                </li>
              </ul>
            </div>

            {/* User Responsibilities */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                3. User Responsibilities
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  <span className="text-white font-medium">Data Accuracy:</span>{" "}
                  Users must provide accurate, complete, and current financial
                  data, process descriptions, and control documentation for the
                  AI to process.
                </li>
                <li>
                  <span className="text-white font-medium">
                    Internal Review:
                  </span>{" "}
                  It is the User’s responsibility to review AI-generated reports
                  for hallucinations or errors before submitting them to
                  regulatory bodies or auditors.
                </li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                4. Intellectual Property
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  <span className="text-white font-medium">
                    Company Ownership:
                  </span>{" "}
                  The Service, including all software, algorithms, user
                  interfaces, documentation, trademarks, and related
                  intellectual property, remains the exclusive property of
                  TaxLegit Consulting Private Limited.
                </li>
                <li>
                  <span className="text-white font-medium">User Content:</span>{" "}
                  Users retain all ownership rights to their raw financial data.
                  By using the Service, Users grant the Company a limited,
                  non-exclusive license to use anonymized data to improve the AI
                  model’s accuracy.
                </li>
              </ul>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                5. Limitation of Liability
              </h2>

              <p className="leading-relaxed text-slate-300">
                The Service is provided on an
                <span className="text-white font-medium">
                  {" "}
                  &quot;as is&quot;
                </span>{" "}
                and
                <span className="text-white font-medium">
                  {" "}
                  &quot;as available&quot;
                </span>{" "}
                basis without warranties of any kind, either express or implied,
                including but not limited to warranties of merchantability,
                fitness for a particular purpose, or non-infringement.
              </p>

              <p className="mt-3 leading-relaxed text-slate-300">
                TaxLegit shall not be liable for any financial discrepancies,
                audit failures, or regulatory penalties resulting from the use
                of the Service. Use of the AI-generated outputs is entirely at
                the User’s own risk.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsAndConditionsPage;
