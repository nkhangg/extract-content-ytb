import { z } from "zod";

class AuthenSchema {
  // Zod schema for validation
  login = z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  resetPassword = z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "Passwords do not match",
      path: ["password_confirmation"],
    });

  forgotPassword = z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
  });
}

export const authenSchema = new AuthenSchema();

export type ResetPasswordValues = z.infer<typeof authenSchema.resetPassword>;
export type LoginValues = z.infer<typeof authenSchema.login>;
export type ForgotPasswordValues = z.infer<typeof authenSchema.forgotPassword>;
