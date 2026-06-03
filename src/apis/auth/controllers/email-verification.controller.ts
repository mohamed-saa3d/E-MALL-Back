import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../utils/app-error";
import verifyEmailService from "../services/email-verification.service";

const emailVerification: RequestHandler<
  {},
  {},
  { email: string , verifyCode: string}
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, verifyCode } = req.body;
    if (!verifyCode || !email)
      throw new AppError("Missing verification code or email", 401);
    await verifyEmailService(email, verifyCode as string);
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err: any) {
    next(err);
  }
};

export default emailVerification;
