import { Router } from "express";
import authorized from "../../../middlewares/authentication";
import { isAuthorized } from "../../../middlewares/authorized";
import validate from "../../../middlewares/validate-body.middleware";
import { Role } from "../../auth/models/user.model";
import { getDeliveryOrdersHandler } from "../controllers/get-delivery-orders.controller";
import { assignDeliveryOrderHandler } from "../controllers/assign-delivery-order.controller";
import { collectDeliveryOrderHandler } from "../controllers/collect-delivery-order.controller";
import { startDeliveryOrderHandler } from "../controllers/start-delivery-order.controller";
import { deliverDeliveryOrderHandler } from "../controllers/deliver-delivery-order.controller";
import { assignDeliverySchema } from "../validations/assign-delivery.validation";

const deliveryRouter = Router();

deliveryRouter.use(authorized, isAuthorized(Role.FULFILLMENT, Role.ADMIN));

deliveryRouter.get("/orders", getDeliveryOrdersHandler);
deliveryRouter.patch(
  "/orders/:orderId/assign",
  validate(assignDeliverySchema),
  assignDeliveryOrderHandler,
);
deliveryRouter.patch("/orders/:orderId/collect", collectDeliveryOrderHandler);
deliveryRouter.patch("/orders/:orderId/start", startDeliveryOrderHandler);
deliveryRouter.patch("/orders/:orderId/deliver", deliverDeliveryOrderHandler);

export default deliveryRouter;
