import { z } from "zod";
export const resetPasswordSchema = z.object({
  email: z
    .email({ message: "Invalid email format" })
    .transform((v) => v.trim().toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain English letters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
});

export default resetPasswordSchema;
