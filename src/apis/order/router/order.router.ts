import { Router } from "express";
import authorized from "../../../middlewares/authentication";
import validate from "../../../middlewares/validate-body.middleware";
import { createOrderHandler } from "../controllers/create-order.controller";
import { getUserOrdersHandler } from "../controllers/get-user-orders.controller";
import { getUserOrderHandler } from "../controllers/get-user-order.controller";
import { acceptPartialOrderHandler } from "../controllers/accept-partial-order.controller";
import { cancelOrderHandler } from "../controllers/cancel-order.controller";
import { createPaymentIntentHandler } from "../controllers/create-payment-intent.controller";
import { createOrderSchema } from "../validations/create-order.validation";

const orderRouter = Router();

orderRouter.use(authorized);

orderRouter.get("/", getUserOrdersHandler);
orderRouter.get("/:orderId", getUserOrderHandler);
orderRouter.post("/", validate(createOrderSchema), createOrderHandler);
orderRouter.patch("/:orderId/accept-partial", acceptPartialOrderHandler);
orderRouter.patch("/:orderId/cancel", cancelOrderHandler);
orderRouter.post("/:orderId/pay", createPaymentIntentHandler);

export default orderRouter;
