import { z } from "zod";
import mongoose from "mongoose";

const isValidObjectId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Create Category validation schema
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),

  parentId: z
    .string()
    .refine(isValidObjectId, "Invalid parent category ID")
    .optional()
    .transform((val) => (val ? new mongoose.Types.ObjectId(val) : undefined)),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;

/**
 * Update Category validation schema
 */
export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name is too long")
    .optional(),

  parentId: z
    .string()
    .refine(isValidObjectId, "Invalid parent category ID")
    .optional()
    .transform((val) => (val ? new mongoose.Types.ObjectId(val) : undefined)),
});

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;

/**
 * Replace Category validation schema
 */
export const replaceCategorySchema = z.object({
  replacementCategoryId: z
    .string()
    .refine(isValidObjectId, "Invalid replacement category ID"),

  reason: z.string().trim().max(500, "Reason is too long").optional(),
});

export type ReplaceCategorySchema = z.infer<typeof replaceCategorySchema>;
