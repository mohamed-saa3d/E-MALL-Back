import { z } from "zod";

const attributeSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

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
        message: "saleStartAt and saleEndAt are required when salePrice is set",
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

const variantSchema = z
  .object({ ...variantShape, _id: z.string().optional() })
  .superRefine(variantRefinement);

export const createVariantSchema = z
  .object({ ...variantShape })
  .superRefine(variantRefinement);

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  basePrice: z.number().min(0).optional(),
  variants: z.array(variantSchema).optional(),
  defaultVariantId: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// filter/query params
export const filterProductsSchema = z.object({
  storeId: z.string().optional(),
  shopId: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(["price-asc", "price-desc", "newest", "best-selling"])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).passthrough();

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
