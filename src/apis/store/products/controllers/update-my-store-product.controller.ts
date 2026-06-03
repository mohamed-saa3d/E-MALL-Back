import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../../utils/app-error";
import { updateMyStoreProduct } from "../services";
import { storeProductParamsSchema } from "../validations/store-product.validation";

/**
 * Updates an existing product under owner store scope.
 */
export const updateMyStoreProductHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { storeId, productId } = storeProductParamsSchema.parse(req.params);
    const product = await updateMyStoreProduct(storeId, productId, req.body, userId);

    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};
