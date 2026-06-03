import { z } from "zod";

export const paymentWebhookSchema = z.object({
  orderId: z.string().trim().min(1),
  event: z.enum([
    "payment.succeeded",
    "payment.failed",
    "payment.refunded",
  ]),
});

export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
