import { NextFunction, Request, Response, RequestHandler } from "express";
import { handlePaymentWebhook } from "../services/handle-payment-webhook.service";
import { PaymentWebhookInput } from "../validations/payment-webhook.validation";

export const paymentWebhookHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body as PaymentWebhookInput;
    const order = await handlePaymentWebhook(payload.orderId, payload.event);

    res.status(200).json({
      status: "success",
      message: "Webhook processed successfully",
      data: { order },
    });
  } catch (err: any) {
    next(err);
  }
};
