import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../utils/app-error";
import requestPasswordReset from "../services/request-password-reset.service";
//send token to email
const forgotPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    await requestPasswordReset(email);
    return res
      .status(200)
      .json({ message: "If the email exists, a reset link has been sent." });
  } catch (err: any) {
    next(err || new AppError("Failed to process forgot password", 500));
  }
};

export default forgotPassword;
