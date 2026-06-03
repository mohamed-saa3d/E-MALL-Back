import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../utils/app-error";
import resetPasswordService from "../services/reset-password.service";
const resetPassword: RequestHandler<
  { token: string },
  { message: string },
  { newPassword: string, confirmPassword: string }
> = async (req: Request, res: Response, next: NextFunction) => {
  let { token } = req.params;
  const { newPassword , confirmPassword} = req.body;

  try {
    if (!token) throw new AppError("Missing token", 400);
    
    if (!newPassword) 
      throw new AppError("new password is required", 400);

    if (!confirmPassword) 
      throw new AppError("confirm new password is required", 400);

    token = Array.isArray(token) ? token[0] : token;

    const isReset = await resetPasswordService(token, newPassword, confirmPassword);

    if (!isReset) throw new AppError("Failed to reset password", 400);

    return res.status(200).json({
      status: "success",
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (err: any) {
    next(err);
  }
};

export default resetPassword;
