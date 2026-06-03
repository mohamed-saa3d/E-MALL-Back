import { z } from "zod";

const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

export const createAddressSchema = z.object({
  street: requiredString("street"),
  city: requiredString("city"),
  distanceMark: requiredString("distanceMark"),
  phone: requiredString("phone"),
  notes: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = z
  .object({
    street: requiredString("street").optional(),
    city: requiredString("city").optional(),
    distanceMark: requiredString("distanceMark").optional(),
    phone: requiredString("phone").optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      data.street !== undefined ||
      data.city !== undefined ||
      data.distanceMark !== undefined ||
      data.phone !== undefined ||
      data.notes !== undefined,
    {
      message: "At least one field is required",
    },
  );

export const setDefaultAddressSchema = z.object({
  isDefault: z.boolean().optional(),
});
