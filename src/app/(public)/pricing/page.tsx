"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Sparkles, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description?: string;
  processLimit: number;
  subprocessLimit: number;
  canDownload: boolean;
  popular: boolean;
  isActive: boolean;
  features: string[];
  ctaText: string;
}

export default function ModernPricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [razorpayKey, setRazorpayKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlansAndKey = async () => {
      try {
        const [plansRes, keyRes] = await Promise.all([
          fetch("/api/plans?active=true"),
          fetch("/api/razorpay-key"), // New API endpoint to fetch Razorpay key
        ]);

        const plansData = await plansRes.json();
        const keyData = await keyRes.json();

        const activePlans = plansData.filter((plan: Plan) => plan.isActive);
        setPlans(activePlans);
        setRazorpayKey(keyData.key_id);
        console.log("Fetched Razorpay Key:", keyData.key_id); // Add logging

        const popularPlan = activePlans.find((p: Plan) => p.popular);
        setSelectedPlan(
          popularPlan ? popularPlan.id : activePlans[0]?.id || null,
        );
      } catch (err) {
        console.error("Failed to fetch plans or Razorpay key:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlansAndKey();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    console.log("Current Session:", session); // Add logging for session
  }, [session]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlan || !razorpayKey || !session?.user?.id) {
      console.error("Missing plan, Razorpay key, or user ID");
      return;
    }

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) {
      console.error("Selected plan not found");
      return;
    }

    try {
      const orderRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.price,
          currency: "INR",
          receipt: `rcpt_${plan.id.substring(0, 10)}_${Date.now()
            .toString()
            .substring(8)}`,
        }),
      });

      const order = await orderRes.json();

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Taxlegit",
        description: `Payment for ${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          const paymentVerificationRes = await fetch("/api/payment-verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              userId: session.user.id, // Assuming user ID is available in session
            }),
          });

          const verificationResult = await paymentVerificationRes.json();

          if (verificationResult.success) {
            alert("Payment Successful!");
            router.push("/dashboard");
          } else {
            alert("Payment Failed: " + verificationResult.message);
          }
        },
        prefill: {
          name: `${session.user.firstName} ${session.user.lastName}` || "User",
          email: session.user.email || "", // Provide an empty string if email is missing
        },
        theme: {
          color: "#8B5CF6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error during Razorpay checkout:", error);
      alert("Payment failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <section className="relative z-10 py-20 bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading plans...</p>
        </div>
      </section>
    );
  }

  if (plans.length === 0) {
    return (
      <section className="relative z-10 py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-4xl font-semibold text-white mb-2">
            No Plans Available
          </h3>
          <p className="text-gray-400">
            We’re preparing something amazing. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="pricing"
      className="relative z-10 py-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="lg:text-5xl text-2xl font-extrabold text-white mb-4 tracking-tight">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Choose a plan that fits your goals
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-10 mb-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative group bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 ${
                  isSelected
                    ? "border-purple-500 shadow-lg shadow-purple-500/30 scale-[1.03]"
                    : "border-slate-700 hover:border-purple-500/40"
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full flex items-center gap-1 shadow-lg shadow-pink-500/20">
                    <Star className="w-3 h-3 fill-current" /> Most Popular
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mt-2">
                    ₹{plan.price}
                    <span className="text-sm text-gray-400"> /one-time</span>
                  </div>
                  {plan.description && (
                    <p className="text-gray-400 mt-2 text-sm">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                    {plan.processLimit} Processes
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                    {plan.subprocessLimit} Subprocesses per process
                  </li>

                  {plan.canDownload && (
                    <li className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                      PDF & Excel downloads
                    </li>
                  )}
                  {plan.features?.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-300"
                    >
                      <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan.id);
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                      : "bg-slate-700/60 text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-500 hover:text-white"
                  }`}
                >
                  {plan.ctaText || (isSelected ? "Selected" : "Choose Plan")}
                </button>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedPlan && (
          <div className="text-center">
            <button
              onClick={handleContinue}
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Continue with {plans.find((p) => p.id === selectedPlan)?.name} →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
