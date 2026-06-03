import { z } from "zod";

const attributeSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

// 1) نعرّف الـ shape كسجل عادي (بدون _id)
const variantShape = {
  sku: z.string().min(1),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  saleStartAt: z.coerce.date().optional(),
  saleEndAt: z.coerce.date().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
  attributes: z.array(attributeSchema).optional(),
};

// 2) نكتب دالة الـ refine مشتركة علشان نعيد استخدامها
function variantRefinement(variant: any, ctx: z.RefinementCtx) {
  if (variant.salePrice !== undefined && variant.salePrice > variant.price) {
    ctx.addIssue({
      code: "custom",
      path: ["salePrice"],
      message: "salePrice must be less than or equal to price",
    });
  }

  const hasWindow =
    variant.saleStartAt !== undefined || variant.saleEndAt !== undefined;

  if (variant.salePrice === undefined && hasWindow) {
    ctx.addIssue({
      code: "custom",
      path: ["salePrice"],
      message: "salePrice is required when saleStartAt/saleEndAt is provided",
    });
  }

  if (variant.salePrice !== undefined) {
    if (!variant.saleStartAt || !variant.saleEndAt) {
      ctx.addIssue({
        code: "custom",
        path: ["saleStartAt"],
        message:
          "saleStartAt and saleEndAt are required when salePrice is set",
      });
    } else if (variant.saleStartAt >= variant.saleEndAt) {
      ctx.addIssue({
        code: "custom",
        path: ["saleEndAt"],
        message: "saleEndAt must be after saleStartAt",
      });
    }
  }
}

// 3) نعمل schema للـ variant اللي بيحتوي _id (لـ update/DB)
export const storeProductVariantSchema = z
  .object({ ...variantShape, _id: z.string().optional() })
  .superRefine(variantRefinement);

// 4) نعمل schema لإنشاء الـ variant (بدون _id) — نفس الـ refine
export const createStoreProductVariantSchema = z
  .object({ ...variantShape })
  .superRefine(variantRefinement);

// 5) ونستخدمها في الـ product schemas
export const createStoreProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1),
  basePrice: z.number().min(0).optional(),
  variants: z.array(createStoreProductVariantSchema).min(1),
  defaultVariantId: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateStoreProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  basePrice: z.number().min(0).optional(),
  variants: z.array(storeProductVariantSchema).optional(),
  addVariant: createStoreProductVariantSchema.optional(),
  defaultVariantId: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const storeIdParamsSchema = z.object({
  storeId: z.string().min(1),
});

export const storeProductParamsSchema = z.object({
  storeId: z.string().min(1),
  productId: z.string().min(1),
});

export const storeProductsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateStoreProductInput = z.infer<typeof createStoreProductSchema>;
export type UpdateStoreProductInput = z.infer<typeof updateStoreProductSchema>;
