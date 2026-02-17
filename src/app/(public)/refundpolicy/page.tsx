import React from "react";

const RefundCancellationPolicyPage: React.FC = () => {
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
            Refund & Cancellation Policy
          </h1>

          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            This policy explains the subscription terms, refund eligibility, and
            cancellation process for the ICFR Generation AI service by TaxLegit
            Consulting Private Limited.
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
            {/* Subscription Terms */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                1. Subscription Terms
              </h2>

              <p className="leading-relaxed text-slate-300 mb-4">
                The Service is offered on a subscription basis with the
                following billing cycles:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  <span className="text-white font-medium">
                    Monthly Subscription:
                  </span>{" "}
                  Billed every 30 days
                </li>
                <li>
                  <span className="text-white font-medium">
                    Annual Subscription:
                  </span>{" "}
                  Billed every 12 months with discounted pricing
                </li>
                <li>
                  <span className="text-white font-medium">
                    Enterprise Plans:
                  </span>{" "}
                  Custom billing terms as agreed in writing
                </li>
              </ul>
            </div>

            {/* Refund Eligibility */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                2. Refund Eligibility
              </h2>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  <span className="text-white font-medium">Trial Period:</span>{" "}
                  If a free trial is offered, no refunds are issued after the
                  trial converts to a paid subscription.
                </li>
                <li>
                  <span className="text-white font-medium">
                    Technical Failure:
                  </span>{" "}
                  Refunds may be considered if a major technical defect prevents
                  the generation of ICFR reports for more than seventy-two (72)
                  consecutive hours and our support team is unable to resolve
                  the issue.
                </li>
                <li>
                  <span className="text-white font-medium">
                    Change of Mind:
                  </span>{" "}
                  We do not offer refunds for change of mind once AI credits
                  have been consumed or reports have been generated.
                </li>
              </ul>
            </div>

            {/* Cancellation Process */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                3. Cancellation Process
              </h2>

              <p className="leading-relaxed text-slate-300 mb-4">
                Users may cancel their subscription at any time using one of the
                following methods:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li>
                  Navigating to{" "}
                  <span className="text-white font-medium">
                    Account Settings &gt; Subscription &gt; Cancel Subscription
                  </span>
                </li>
                <li>
                  Contacting{" "}
                  <span className="text-white font-medium">
                    support@taxlegit.com
                  </span>{" "}
                  with a cancellation request
                </li>
                <li>
                  Sending a written notice to our registered business address
                </li>
              </ul>
            </div>

            {/* Payment Terms */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">
                4. Payment Terms
              </h2>

              <h3 className="text-lg font-semibold text-white mb-2">
                Automatic Renewal
              </h3>
              <p className="leading-relaxed text-slate-300 mb-4">
                Subscriptions automatically renew at the end of each billing
                cycle unless cancelled before the renewal date. You will be
                charged the then-current subscription rate.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2">
                Payment Methods
              </h3>
              <p className="leading-relaxed text-slate-300 mb-4">
                We accept payments via credit cards, debit cards, net banking,
                UPI, and other payment methods displayed during checkout. All
                payments are processed through secure, PCI-DSS compliant payment
                gateways.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2">
                Failed Payments
              </h3>
              <p className="leading-relaxed text-slate-300">
                If all payment attempts fail, your account will be suspended
                until payment is received. Suspended accounts are subject to
                data deletion after ninety (90) days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RefundCancellationPolicyPage;
