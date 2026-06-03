import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../../utils/app-error";
import { deleteMyStoreProduct } from "../services";
import { storeProductParamsSchema } from "../validations/store-product.validation";

/**
 * DELETE /stores/:storeId/manage/products/:productId - Delete store product (owner/admin)
 */
export const deleteMyStoreProductHandler: RequestHandler<{},{status: string, message: string}> = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { storeId, productId } = storeProductParamsSchema.parse(req.params);
   await deleteMyStoreProduct(storeId, productId, userId);

    res.status(200).json({ status: "success", message :"Product deleted successfully" });
  } catch (err: any) {
    next(err);
  }
};
