import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../../utils/app-error";
import { getMyStoreProduct } from "../services";
import { storeProductParamsSchema } from "../validations/store-product.validation";

/**
 * Returns a single store product for owner dashboard view.
 */
export const getMyStoreProductHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { storeId, productId } = storeProductParamsSchema.parse(req.params);
    const product = await getMyStoreProduct(storeId, productId, userId);

    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};
