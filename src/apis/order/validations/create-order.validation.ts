import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().trim().min(1),
  paymentMethod: z.enum(["cod", "online"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
