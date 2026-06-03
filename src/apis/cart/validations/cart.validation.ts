import { z } from "zod";

export const addCartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).optional(),
});

export const decreaseCartItemSchema = z.object({
  quantity: z.number().int().min(1).optional(),
});
