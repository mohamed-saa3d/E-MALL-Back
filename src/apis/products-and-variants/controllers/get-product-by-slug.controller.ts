import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import AppError from "../../../utils/app-error";

const getProductBySlug: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = String(req.params.slug);
    if (!slug) throw new AppError("Missing slug", 400);
    const storeId =
      typeof req.query.storeId === "string"? req.query.storeId: undefined;
    const product = await productService.getProductBySlug(slug, storeId);
    res.status(200).json({ status: "success", data: { product } });
  } catch (err: any) {
    next(err);
  }
};

export default getProductBySlug;
