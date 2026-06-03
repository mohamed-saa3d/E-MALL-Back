import { Router } from "express";
import authorized from "../../../middlewares/authentication";
import validate from "../../../middlewares/validate-body.middleware";
import getWishList from "../controllers/get-wishlist.controller";
import addWishItem from "../controllers/add-wishlist-item.controller";
import removeWishItem from "../controllers/remove-wishlist.controller";
import clearWishList from "../controllers/clear-wishlist.controller";
import { addSchema } from "../validation/add-item";

const wishRouter = Router();

wishRouter.use(authorized);

wishRouter.get("/", getWishList);
wishRouter.post("/item", validate(addSchema), addWishItem);
wishRouter.delete("/item/:variantId", removeWishItem);
wishRouter.delete("/", clearWishList);

export default wishRouter;
