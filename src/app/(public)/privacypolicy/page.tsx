import React from "react";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[300px] w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-600/20 blur-3xl rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>

          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            This Privacy Policy explains how TaxLegit Consulting Private Limited
            collects, uses, and protects your information while using the ICFR
            Generation AI platform.
          </p>

          <p className="text-sm text-white py-4 underline">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="min-h-screen bg-slate-950 text-slate-200 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10">
            {/* Intro */}
            <div>
              <p className="leading-relaxed text-slate-300">
                TaxLegit Consulting Private Limited is committed to protecting
                the privacy and security of your personal and financial
                information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard information when you use our ICFR
                Generation AI Service.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                1. Information We Collect
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  <span className="text-white font-medium">
                    Financial Data:
                  </span>{" "}
                  Financial metadata, control descriptions, and process flows
                  uploaded for ICFR generation.
                </li>
                <li>
                  <span className="text-white font-medium">Account Data:</span>{" "}
                  Names, email addresses, phone numbers, job titles, company
                  names, professional credentials, and billing information
                  necessary to create and manage your account.
                </li>
                <li>
                  <span className="text-white font-medium">Usage Data:</span>{" "}
                  Information about how you interact with the AI platform,
                  collected automatically to improve system performance and
                  reliability.
                </li>
              </ul>
            </div>

            {/* How We Use Data */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                2. How We Use Your Data
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  Generate customised ICFR documentation and risk-control
                  matrices
                </li>
                <li>Maintain and secure your account</li>
                <li>Refine and improve our machine learning models</li>
                <li>
                  Protect against fraud, security threats, and illegal activity
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                3. Data Security
              </h2>

              <p className="leading-relaxed text-slate-300 mb-4">
                We implement enterprise-grade security measures to protect your
                data, including:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  <span className="text-white font-medium">
                    Encryption at Rest:
                  </span>{" "}
                  AES-256 encryption for all stored data
                </li>
                <li>
                  <span className="text-white font-medium">
                    Encryption in Transit:
                  </span>{" "}
                  TLS 1.3 or higher for all data transmission
                </li>
                <li>
                  <span className="text-white font-medium">
                    Access Controls:
                  </span>{" "}
                  Role-based access with multi-factor authentication
                </li>
                <li>
                  <span className="text-white font-medium">
                    Network Security:
                  </span>{" "}
                  Firewalls, intrusion detection, and regular vulnerability
                  scanning
                </li>
                <li>
                  <span className="text-white font-medium">
                    Secure Infrastructure:
                  </span>{" "}
                  ISO 27001-certified cloud hosting providers
                </li>
              </ul>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                4. Data Retention
              </h2>

              <p className="leading-relaxed text-slate-300">
                User data is retained only for the duration of the subscription
                period plus a grace period, after which it is permanently
                deleted from our active servers unless legal requirements
                dictate otherwise. We maintain:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-300 mt-3">
                <li>Regular security audits and penetration testing</li>
                <li>
                  Employee training on data protection and security best
                  practices
                </li>
                <li>Strict confidentiality agreements with all personnel</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </div>

            {/* Privacy Rights */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                5. Your Privacy Rights
              </h2>

              <p className="leading-relaxed text-slate-300">
                You have the right to access your personal data and request a
                copy in a portable format. You may update or correct inaccurate
                personal information through your account dashboard or by
                contacting us directly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicyPage;
