import { NextFunction, Request, RequestHandler, Response } from "express";
import { listStoreProductsPublic } from "../services";
import {
  storeIdParamsSchema,
  storeProductsQuerySchema,
} from "../validations/store-product.validation";

/**
 * Lists public products for a store page that customers browse.
 */
export const listStoreProductsPublicHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId } = storeIdParamsSchema.parse(req.params);
    const query = storeProductsQuerySchema.parse(req.query);
    const data = await listStoreProductsPublic(storeId, query);

    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};
