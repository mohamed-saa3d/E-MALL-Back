import { NextFunction, Request, RequestHandler, Response } from "express";
import { getStoreProductPublic } from "../services";
import { storeProductParamsSchema } from "../validations/store-product.validation";

/**
 * Returns one product for customer/public store page.
 */
export const getStoreProductPublicHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, productId } = storeProductParamsSchema.parse(req.params);
    const product = await getStoreProductPublic(storeId, productId);

    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};
