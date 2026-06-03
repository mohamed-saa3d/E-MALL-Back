import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import { filterProductsSchema } from "../validations/product.validation";

const listProducts: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = filterProductsSchema.parse(req.query as any);
    const result = await productService.listProducts(params);
    res.status(200).json({ status: "success", data: result });
  } catch (err: any) {
    next(err);
  }
};

export default listProducts;
