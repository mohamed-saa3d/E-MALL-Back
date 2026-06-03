import {
  isVariantSaleActive,
  resolveVariantPrice,
} from "../../../../products-and-variants/services/resolve-variant-price.util";

/**
 * Adds runtime pricing fields to a variant based on the current time window.
 */
export const decorateVariantPricing = (variant: any) => {
  const now = new Date();
  return {
    ...variant,
    isSaleActive: isVariantSaleActive(variant, now),
    currentPrice: resolveVariantPrice(variant, now),
  };
};
