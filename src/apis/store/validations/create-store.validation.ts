import mongoose, { isValidObjectId } from "mongoose";
import z from "zod";

export const createStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),

    email : z
    .email({ message: "Invalid email format" })
    .transform((v) => v.trim().toLowerCase()),

    categoryName: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name is too long")
    .optional(),

    categoryId: z
    .string()
    .refine(isValidObjectId, "Invalid category ID")
    .optional()
    .transform((val) => (val ? new mongoose.Types.ObjectId(val) : undefined)),

    authorizedBrand: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name is too long")
    .optional(),

    logo: z
    .string()
    .trim()
    .min(1, "invalid logo")
    .max(100, "invalid logo")
    .optional(),

    openingTime: z
    .string()
    .trim()
    .min(5, "time must in HH:MM format")
    .max(5, "time must in HH:MM format")
    .optional(),

    closingTime: z
    .string()
    .trim()
    .min(5, "time must in HH:MM format")
    .max(5, "time must in HH:MM format")
    .optional(),

    
});