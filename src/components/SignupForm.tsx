"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { BiMailSend } from "react-icons/bi";
import { MdVerifiedUser } from "react-icons/md";

export default function SignupForm() {
  const pathname = usePathname();
  const [isLogin, setIsLogin] = useState(pathname === "/login");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    if (!formData.phone) {
      setMessage("Please enter phone number");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, isSignup: !isLogin }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setMessage("OTP sent to your phone");
      } else {
        setMessage(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage("Something went wrong while sending OTP. Please try again.");
    }

    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!formData.otp) {
      setMessage("Please enter OTP");
      return;
    }
    if (!isLogin && (!formData.firstName || !formData.lastName)) {
      setMessage("Please fill all fields");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      // Use NextAuth signIn with our custom OTP provider
      const result = await signIn("otp", {
        phone: formData.phone,
        otp: formData.otp,
        firstName: isLogin ? "" : formData.firstName, // ✅ Empty string instead of undefined
        lastName: isLogin ? "" : formData.lastName, // ✅ Empty string instead of undefined
        isSignup: String(!isLogin), // ✅ Convert boolean to string "true" or "false"
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.ok) {
        setMessage(isLogin ? "Login successful!" : "Signup successful!");
        // Redirect based on user role - sub-users go to /subuser, main users to /dashboard
        setTimeout(() => {
          // We'll need to check the session to determine the role
          // For now, redirect to dashboard and let the dashboard handle the logic
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setMessage(result?.error || "Verification failed");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage("Error verifying OTP");
    }
    setLoading(false);
  };

  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    setFormData({ firstName: "", lastName: "", phone: "", otp: "" });
    setOtpSent(false);
    setMessage("");
    // Navigate to the appropriate page
    window.location.href = newIsLogin ? "/login" : "/signup";
  };

  return (
    <div className=" min-h-screen flex items-center justify-center  p-4">
      <div className="w-full max-w-md">
        <div className="bg-blue-50 rounded-2xl shadow-xl p-8 transition-all duration-300">
          <h2 className="text-4xl font-bold mb-2 text-center text-gray-800">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-center text-gray-500 mb-8">
            {isLogin ? "Login to continue" : "Sign up to get started"}
          </p>

          {/* Google Sign In Button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mb-4 flex items-center justify-center"
          >
            <FcGoogle className="w-6 h-6 mr-3" />
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with phone
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: !isLogin ? "200px" : "0px",
                opacity: !isLogin ? 1 : 0,
              }}
            >
              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <input
              type="tel"
              name="phone"
              placeholder="Contact Number"
              value={formData.phone}
              onChange={handleChange}
              disabled={otpSent}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
            />

            {!otpSent ? (
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <BiMailSend className="w-6 h-6 mr-3" />
                    Sending...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>
            ) : (
              <div
                className="space-y-4 animate-fade-in"
                style={{
                  animation: "fadeIn 0.3s ease-in",
                }}
              >
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                />
                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <MdVerifiedUser className="w-6 h-6 mr-3" />
                      Verifying...
                    </span>
                  ) : (
                    `Verify & ${isLogin ? "Login" : "Signup"}`
                  )}
                </button>
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setFormData({ ...formData, otp: "" });
                    setMessage("");
                  }}
                  className="w-full text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all text-sm"
                >
                  Resend OTP
                </button>
              </div>
            )}

            {message && (
              <div
                className={`text-center p-3 rounded-lg transition-all duration-300 ${
                  message.includes("successful")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
                style={{
                  animation: "slideDown 0.3s ease-out",
                }}
              >
                {message}
              </div>
            )}

            <div className="text-center pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
