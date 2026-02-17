import React from "react";
import { CheckCircle } from "lucide-react";

export const PricingSection = () => {
  const pricingPlans = [
    {
      name: "Free Trial",
      price: "₹0",
      description: "Experience the power",
      features: [
        "1 Process with complete details",
        "1 Subprocess per process",
        "Full risk & mitigation analysis",
        "View-only access",
        "48-hour trial period",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Starter",
      price: "₹499",
      description: "Perfect for small teams",
      features: [
        "5 Complete Processes",
        "All subprocesses included",
        "Complete task breakdown",
        "PDF & Excel downloads",
        "Lifetime access to generated SOPs",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Professional",
      price: "₹999",
      description: "Complete business solution",
      features: [
        "Unlimited Processes",
        "Full subprocess generation",
        "Complete documentation",
        "Priority support",
        "Lifetime access & updates",
      ],
      cta: "Go Professional",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative z-10 py-20 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6 ">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Pay only for what you need, when you need it
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-slate-800/50 backdrop-blur rounded-2xl p-8 border ${
                plan.popular
                  ? "border-purple-500 scale-105"
                  : "border-purple-500/20"
              } hover:scale-105 transition transform`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>
              <div className="text-4xl font-bold text-white mb-2">
                {plan.price}
                {plan.price !== "₹0" && (
                  <span className="text-lg text-gray-400">/one-time</span>
                )}
              </div>
              <p className="text-gray-400 mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
