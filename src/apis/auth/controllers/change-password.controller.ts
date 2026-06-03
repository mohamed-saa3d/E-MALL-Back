import { NextFunction, Request, RequestHandler, Response } from "express";
import changePasswordLogic from "../services/change-password.service";
import AppError from "../../../utils/app-error";

const changePassword: RequestHandler<
  {},
  { message: string },
  { oldPassword: string; newPassword: string; confirmNewPassword: string }
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const id  = req.user?.id;

    if (!id) {
      throw new AppError("please login", 401);
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      throw new Error("Missing required fields");
    }
    
   const isChanged = await changePasswordLogic(id, oldPassword, newPassword, confirmNewPassword);

    if (isChanged) {
      return res.status(200).json({ message: "Password changed successfully" });
    } else {
      throw new Error("Failed to change password");
    }
  } catch (err: any) {
    next(err);
  }
};

export default changePassword;