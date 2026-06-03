type VariantPricingInput = {
  price: number;
  salePrice?: number | null;
  saleStartAt?: Date | string | null;
  saleEndAt?: Date | string | null;
};

const toDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  const dateValue = value instanceof Date ? value : new Date(value);
  return Number.isNaN(dateValue.getTime()) ? null : dateValue;
};

export const isVariantSaleActive = (
  variant: VariantPricingInput,
  at: Date = new Date(),
): boolean => {
  if (variant.salePrice === undefined || variant.salePrice === null) {
    return false;
  }

  if (variant.salePrice >= variant.price) {
    return false;
  }

  const saleStartAt = toDate(variant.saleStartAt);
  const saleEndAt = toDate(variant.saleEndAt);

  if (saleStartAt && at < saleStartAt) {
    return false;
  }

  if (saleEndAt && at > saleEndAt) {
    return false;
  }

  return true;
};

export const resolveVariantPrice = (
  variant: VariantPricingInput,
  at: Date = new Date(),
): number => {
  return isVariantSaleActive(variant, at) ? Number(variant.salePrice) : Number(variant.price);
};
