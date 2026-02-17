import React from "react";
import { AnimatedBackground } from "@/components/pages/home/AnimatedBackground";
import HeroSection from "@/components/pages/home/HeroSection";
import StatsSection from "@/components/pages/home/StatSection";
import FeaturesSection from "@/components/pages/home/FeatureSection";
import ICFRstep from "@/components/pages/home/ICFRSteps";
export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatedBackground />
      <HeroSection />
      <StatsSection />
      <ICFRstep />
      <FeaturesSection />
    </div>
  );
}
