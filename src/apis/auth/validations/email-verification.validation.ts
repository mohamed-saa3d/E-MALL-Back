import { z } from "zod";

export const emailVerificationSchema = z.object({
  email: z
    .email({ message: "Invalid email format" })
    .transform((v) => v.trim().toLowerCase()),

  verifyCode: z
    .string()
    .trim()
    .regex(/^\d+$/, {
      message: "Code must contain only digits",
    })
    .length(6, {
      message: "Invalid code format",
    }),
});

export const sendCodeEmailVerificationSchema = z.object({
  email: z
    .email({ message: "Invalid email format" })
    .transform((v) => v.trim().toLowerCase()),
});