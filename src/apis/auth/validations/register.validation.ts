import { z } from "zod";

/**
 * Register validation schema (strict)
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),

  email: z
    .email({ message: "Invalid email format" })
    .transform((v) => v.trim().toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain English letters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),

  phoneNumber: z
    .string()
    .regex(/^01\d{9}$/, "Phone number must start with 01 and be 11 digits long")
    .optional(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
