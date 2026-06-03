import { Router } from "express";
import authorized from "../../../middlewares/authentication";
import validate from "../../../middlewares/validate-body.middleware";
import {
  addCartItemSchema,
  decreaseCartItemSchema,
} from "../validations/cart.validation";
import getCart from "../controllers/get-cart.controller";
import addCartItem from "../controllers/add-cart-item.controller";
import decreaseCartItem from "../controllers/decrease-cart-item.controller";
import removeCartItem from "../controllers/remove-cart-item.controller";
import clearCart from "../controllers/clear-cart.controller";

const cartRouter = Router();
 
// all routes require authentication because cart is per-user
cartRouter.use(authorized);

cartRouter.get("/", getCart);
cartRouter.post("/item", validate(addCartItemSchema), addCartItem);
cartRouter.patch(
  "/items/:variantId/decrease",
  validate(decreaseCartItemSchema),
  decreaseCartItem,
);
cartRouter.delete("/item/:variantId", removeCartItem);
cartRouter.delete("/", clearCart);

export default cartRouter;
