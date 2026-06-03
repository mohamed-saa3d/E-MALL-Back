import { decorateVariantPricing } from "./decorate-variant-pricing.util";

/**
 * Adds computed pricing fields to product variants and resolves default variant view.
 */
export const decorateProductPricing = (product: any) => {
  const variants = Array.isArray(product.variants)
    ? product.variants.map((variant: any) => decorateVariantPricing(variant))
    : [];

  const defaultVariant =
    variants.find(
      (variant: any) =>
        product.defaultVariantId &&
        String(variant._id) === String(product.defaultVariantId),
    ) || variants.find((variant: any) => variant.isDefault) || variants[0];

  return {
    ...product,
    variants,
    defaultVariant,
  };
};
