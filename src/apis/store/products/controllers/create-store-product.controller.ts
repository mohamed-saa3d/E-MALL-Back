import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../../utils/app-error";
import { createStoreProduct } from "../services";
import { storeIdParamsSchema } from "../validations/store-product.validation";

/**
 * Creates a new product under `/store/my-store/:storeId/products`.
 */
export const createStoreProductHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { storeId } = storeIdParamsSchema.parse(req.params);
    const product = await createStoreProduct(storeId, req.body, userId);

    res.status(201).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};
