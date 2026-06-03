import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ message: "Invalid email format" })
    .transform((v) => v.trim().toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});
