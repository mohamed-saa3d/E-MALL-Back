import { z } from "zod";

export const assignDeliverySchema = z.object({
  riderId: z.string().trim().min(1).optional(),
});

export type AssignDeliveryInput = z.infer<typeof assignDeliverySchema>;
