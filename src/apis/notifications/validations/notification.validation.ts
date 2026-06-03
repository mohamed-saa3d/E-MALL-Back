import { z } from "zod";

export const notificationIdParamsSchema = z.object({
  id: z.string().min(1, "Notification id is required"),
});

export const getNotificationsQuerySchema = z.object({
  page: z
    .preprocess((value) => {
      if (typeof value === "string") return Number(value);
      return value;
    }, z.number().int().positive())
    .optional()
    .default(1),
  limit: z
    .preprocess((value) => {
      if (typeof value === "string") return Number(value);
      return value;
    }, z.number().int().positive())
    .optional()
    .default(20),
});
