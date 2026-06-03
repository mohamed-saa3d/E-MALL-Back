import { z } from "zod";
export const forgotPasswordSchema = z.object({
  email: z
    .email({ message: "Invalid email format" })
    .transform((v) => v.trim().toLowerCase()),
});

export default forgotPasswordSchema;
