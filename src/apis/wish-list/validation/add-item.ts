
import z from "zod";

export const addSchema = z.object({ variantId: z.string().min(1) });