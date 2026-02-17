"use client";
import {
  Zap,
  Sparkles,
  Shield,
  FileText,
  Users,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="relative bg-black overflow-hidden ">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-10 ">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className=" lg:text-sm text-[10px] text-purple-200 font-medium">
                AI-Powered SOP Generation Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-xl lg:text-4xl  font-bold leading-tight">
              <span className="text-white">The intuitive </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                SOP platform
              </span>
              <br />
              <span className="text-white">for fast-growing businesses</span>
            </h1>

            <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl">
              Automate your documentation with AI-powered SOPs, ready-to-use
              templates, process simulation, and scalable documentation
              platform.
            </p>

            {/* Feature bullets */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm">
                  Create SOPs in minutes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm">
                  Keep processes clean
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm">
                  Motivate your team
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-3 pt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-white font-semibold">5</span>
              <span className="text-gray-400 text-sm">5-STAR RATING</span>
            </div>
          </div>

          {/* Right Content - Image Mockup */}
          <div className="relative lg:block hidden flex-1 -mt-10">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main image mockup */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-700 mt-10">
                <Image
                  src="/images/hero.png" // replace with your uploaded image path
                  alt="SOP Dashboard Preview"
                  className="w-full h-auto object-cover"
                  width={500}
                  height={400}
                  priority
                />
                {/* Subtle overlay for glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating icons outside the image corners */}
              <div className="absolute -top-6 -left-6 z-20 bg-gradient-to-br from-purple-600/30 to-purple-600/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl animate-float">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>

              <div
                className="absolute -bottom-6 -left-6 z-20 bg-gradient-to-br from-pink-600/30 to-pink-600/10 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-4 shadow-2xl animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <TrendingUp className="w-8 h-8 text-pink-400" />
              </div>

              <div
                className="absolute -top-6 -right-6 z-20 bg-gradient-to-br from-blue-600/30 to-blue-600/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl animate-float"
                style={{ animationDelay: "1s" }}
              >
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(-50%) translateX(0px);
          }
          50% {
            transform: translateY(-50%) translateX(-5px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
