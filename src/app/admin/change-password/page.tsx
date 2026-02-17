"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
// import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/ToastProvider";
import { changePasswordSchema, ChangePasswordSchema } from "@/lib/validations";

// const changePasswordSchema = z.object({
//   currentPassword: z.string().min(1, 'Current password is required'),
//   newPassword: z
//     .string()
//     .min(8, 'Password must be at least 8 characters')
//     .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
//     .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
//     .regex(/[0-9]/, 'Password must contain at least one number')
//     .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
//   confirmPassword: z.string().min(1, 'Please confirm your password'),
// }).refine((data) => data.newPassword === data.confirmPassword, {
//   message: 'Passwords do not match',
//   path: ['confirmPassword'],
// });

// type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    // watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  // const newPassword = watch("newPassword");

  // const validation = {
  //   length: newPassword?.length >= 8,
  //   uppercase: /[A-Z]/.test(newPassword || ""),
  //   lowercase: /[a-z]/.test(newPassword || ""),
  //   number: /[0-9]/.test(newPassword || ""),
  //   special: /[!@#$%^&*]/.test(newPassword || ""),
  // };

  const onSubmit = async (data: ChangePasswordSchema) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showError(result.error || "Failed to change password");
        return;
      }

      showSuccess(result.message || "Password changed successfully!");
      reset();
    } catch {
      console.error("Error changing password:");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Lock className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-semibold text-gray-900">
                Change Password
              </h1>
              <p className="text-sm text-gray-500">
                Update your account password securely
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    {...register("currentPassword")}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-red-600 mt-2">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    {...register("newPassword")}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNew ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-600 mt-2">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    {...register("confirmPassword")}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-2">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading || isSubmitting}
                className="w-full py-3 px-6 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
          <p className="text-xs text-indigo-800">
            <span className="font-semibold">Security Tip:</span> Choose a
            strong, unique password that you don&apos;t use for other accounts.
            Consider using a password manager to keep track of your passwords
            securely.
          </p>
        </div>
      </div>
    </div>
  );
}
