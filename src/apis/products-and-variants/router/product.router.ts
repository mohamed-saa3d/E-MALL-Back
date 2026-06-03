import { Router } from "express";
import listProducts from "../controllers/list-products.controller";
import getProductBySlug from "../controllers/get-product-by-slug.controller";

const productRouter = Router();

// public endpoints
// validation of query parameters handled inside controller
productRouter.get("/", listProducts);
productRouter.get("/:slug", getProductBySlug);

// protected endpoints

export default productRouter;
