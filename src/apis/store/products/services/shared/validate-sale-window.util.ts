import AppError from "../../../../../utils/app-error";

/**
 * Validates variant sale window constraints around salePrice/start/end fields.
 */
export const validateSaleWindow = (variant: any) => {
  if (variant.salePrice === undefined || variant.salePrice === null) {
    if (variant.saleStartAt || variant.saleEndAt) {
      throw new AppError(
        "salePrice is required when saleStartAt/saleEndAt is provided",
        400,
      );
    }
    return;
  }

  if (variant.salePrice > variant.price) {
    throw new AppError("salePrice must be less than or equal to price", 400);
  }

  if (!variant.saleStartAt || !variant.saleEndAt) {
    throw new AppError("saleStartAt and saleEndAt are required when salePrice is set", 400);
  }

  const startDate = new Date(variant.saleStartAt);
  const endDate = new Date(variant.saleEndAt);
  if (startDate >= endDate) {
    throw new AppError("saleEndAt must be after saleStartAt", 400);
  }
};
