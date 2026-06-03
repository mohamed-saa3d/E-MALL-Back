import { Router } from "express";
import validate from "../../../middlewares/validate-body.middleware";
import { paymentWebhookHandler } from "../controllers/payment-webhook.controller";
import { paymentWebhookSchema } from "../validations/payment-webhook.validation";

const paymentRouter = Router();

paymentRouter.post("/webhook", validate(paymentWebhookSchema), paymentWebhookHandler);

export default paymentRouter;
