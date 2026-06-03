import { z } from "zod";

export const updateStoreOrderSchema = z
  .object({
    status: z.enum(["pending", "preparing", "ready", "rejected"]).optional(),
    rejectionReason: z.string().trim().optional(),
    missingItems: z
      .array(
        z.object({
          orderItemId: z.string().trim().min(1),
          reason: z.string().trim().min(1),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasRejectionData =
      !!data.rejectionReason ||
      (Array.isArray(data.missingItems) && data.missingItems.length > 0);

    if (!data.status && !hasRejectionData) {
      ctx.addIssue({
        code: "custom",
        message: "At least one update field is required",
        path: ["status"],
      });
    }

    if (
      data.status === "rejected" &&
      !data.rejectionReason &&
      (!data.missingItems || data.missingItems.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "rejectionReason or missingItems is required when status is rejected",
        path: ["rejectionReason"],
      });
    }

    if (data.status && data.status !== "rejected" && hasRejectionData) {
      ctx.addIssue({
        code: "custom",
        message:
          "rejectionReason and missingItems can only be sent with rejected status or without status to infer rejection",
        path: ["status"],
      });
    }
  });

export type UpdateStoreOrderInput = z.infer<typeof updateStoreOrderSchema>;
