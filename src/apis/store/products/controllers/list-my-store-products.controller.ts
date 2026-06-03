import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../../utils/app-error";
import { listMyStoreProducts } from "../services";
import {
  storeIdParamsSchema,
  storeProductsQuerySchema,
} from "../validations/store-product.validation";

/**
 * Lists products for store owner view.
 */
export const listMyStoreProductsHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { storeId } = storeIdParamsSchema.parse(req.params);
    const query = storeProductsQuerySchema.parse(req.query);
    const data = await listMyStoreProducts(storeId, userId, query);

    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};
