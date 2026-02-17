// lib/validations/index.ts
import { z } from "zod";

// Password schemas
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Plan schemas
export const planBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z
    .number()
    .int()
    .refine((val) => val >= -1, {
      message: "Price must be -1 (unlimited), 0 (free), or a positive value",
    }),
  processLimit: z
    .number()
    .int()
    .nonnegative("Process limit must be non-negative"),
  subprocessLimit: z
    .number()
    .int()
    .nonnegative("Subprocess limit must be non-negative"),
  canDownloadProcess: z.boolean().default(false),
  canDownloadRCM: z.boolean().default(false),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  features: z.array(z.string()).default([]),
  popular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const createPlanSchema = z.object({
  name: z.string().min(0, "Plan name is required"),
  price: z.number().int().min(0),
  processLimit: z.number().int().min(1),
  subprocessLimit: z.number().int().min(1),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  features: z.array(z.string()).optional(),
  popular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  // ✅ ADD DOWNLOAD FIELDS TO VALIDATION
  canDownloadProcess: z.boolean().optional(),
  canDownloadRCM: z.boolean().optional(),
  canDownloadPDF: z.boolean().optional(),
});

// lib/validations/index.ts
export const updatePlanSchema = z.object({
  name: z.string().min(0, "Plan name is required").optional(),
  price: z.number().int().min(0).optional(),
  processLimit: z.number().int().min(1).optional(),
  subprocessLimit: z.number().int().min(1).optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  features: z.array(z.string()).optional(),
  popular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  canDownloadProcess: z.boolean().optional(),
  canDownloadRCM: z.boolean().optional(),
  canDownloadPDF: z.boolean().optional(),
});

export const planIdSchema = z.object({
  id: z.string().min(1, "Plan ID is required"),
});

// Export all types
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type PlanBaseSchema = z.infer<typeof planBaseSchema>;
export type CreatePlanSchema = z.infer<typeof createPlanSchema>;
export type UpdatePlanSchema = z.infer<typeof updatePlanSchema>;
export type PlanIdSchema = z.infer<typeof planIdSchema>;
