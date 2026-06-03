import { NextFunction, Request, RequestHandler, Response } from "express";
import emailSendCodeVerificationService from "../services/email-send-code-verifcation.service";

const sendCodeEmailVerification: RequestHandler<
  {},
  { message: string },
  { email: string }
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
  

    await emailSendCodeVerificationService(req.body.email);

    return res
      .status(200)
      .json({ message: "Email verification code sent successfully" });
  } catch (err: any) {
    next(err);
  }
};

export default sendCodeEmailVerification;
