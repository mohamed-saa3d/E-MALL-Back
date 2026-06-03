import { Router } from "express";
import createStore from "../controller/create-store.controller";
import { getDashboardHandler } from "../controller/dashboard.controller";
import { listAllStores } from "../controller/get-all-stores.controller";
import { listStoresByCategory } from "../controller/get-stores-by-category.controller";
import { getMyStoreHandler } from "../controller/get-my-store.controller";
import { getMyStoreByOwnerHandler } from "../controller/get-my-store-by-owner.controller";
import { updateMyStoreHandler } from "../controller/update-store.controller";
import { getMyOrdersHandler } from "../controller/get-my-orders.controller";
import { getMyOrderHandler } from "../controller/get-my-order.controller";
import { updateMyOrderHandler } from "../controller/update-my-order.controller";
import {
  softDeleteStoreHandler,
  hardDeleteStoreHandler,
} from "../controller/delete-store.controller";
import authorized from "../../../middlewares/authentication";
import { isAuthorized } from "../../../middlewares/authorized";
import { Role } from "../../auth/models/user.model";
import { createStoreSchema } from "../validations/create-store.validation";
import { updateStoreOrderSchema } from "../validations/store-order.validation";
import validate from "../../../middlewares/validate-body.middleware";
import {
  createStoreProductHandler,
  deleteMyStoreProductHandler,
  getMyStoreProductHandler,
  getStoreProductPublicHandler,
  listMyStoreProductsHandler,
  listStoreProductsPublicHandler,
  updateMyStoreProductHandler,

} from "../products/controllers";
import {
  createStoreProductSchema,
  updateStoreProductSchema,
} from "../products/validations/store-product.validation";
import getStoreByIdHandler from "../controller/get-store-by-id.controller";

const storeRouter = Router();

/* Public */
storeRouter.get("/", listAllStores);
storeRouter.get("/category/:categoryId", listStoresByCategory);

/* Admin (must be before /:storeId) */
storeRouter.get("/admin", authorized, isAuthorized(Role.ADMIN), listAllStores);


/* Public Store */
storeRouter.get("/:storeId", getStoreByIdHandler);
storeRouter.get("/:storeId/products", listStoreProductsPublicHandler);
storeRouter.get("/:storeId/products/:productId", getStoreProductPublicHandler);

storeRouter.post(
  "/",
  authorized,
  isAuthorized(Role.ADMIN),
  validate(createStoreSchema),
  createStore
);

/* Store Settings */
storeRouter.get(
  "/my-store",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  getMyStoreByOwnerHandler
);

storeRouter.patch(
  "/:storeId/manage/settings",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  updateMyStoreHandler
);

/* Store Dashboard */
storeRouter.get(
  "/:storeId/manage/dashboard",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  getDashboardHandler
);

storeRouter.delete(
  "/:storeId/manage/delete",
  authorized,
  isAuthorized(Role.ADMIN),
  hardDeleteStoreHandler
);

/* Store Products Management */

storeRouter.get(
  "/:storeId/manage/products",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  listMyStoreProductsHandler
);

storeRouter.get(
  "/:storeId/manage/products/:productId",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  getMyStoreProductHandler
);

storeRouter.post(
  "/:storeId/manage/products",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  validate(createStoreProductSchema),
  createStoreProductHandler
);

storeRouter.patch(
  "/:storeId/manage/products/:productId",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  validate(updateStoreProductSchema),
  updateMyStoreProductHandler
);

storeRouter.delete(
  "/:storeId/manage/products/:productId",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  deleteMyStoreProductHandler
);

/* Orders */

storeRouter.get(
  "/:storeId/manage/orders",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  getMyOrdersHandler
);

storeRouter.get(
  "/:storeId/manage/orders/:orderId",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  getMyOrderHandler
);

storeRouter.patch(
  "/:storeId/manage/orders/:orderId",
  authorized,
  isAuthorized(Role.OWNER, Role.ADMIN),
  validate(updateStoreOrderSchema),
  updateMyOrderHandler
);

export default storeRouter;
