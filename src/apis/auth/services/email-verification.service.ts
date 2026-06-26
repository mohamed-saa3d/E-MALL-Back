
import AppError from "../../../utils/app-error";
import User from "../models/user.model";
import {  findActiveTokenByRaw } from "./token.service";

async function emailVerification(email: string,verifyCode:string) {

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 400);
  }
  if (user.isEmailVerified === true) {
    throw new AppError("Email already verified", 400);
  }

  const code = await findActiveTokenByRaw(verifyCode, "verify");

  if (!code) {
    throw new AppError("Invalid or expired code", 400);
  }

  await user.updateOne({ isEmailVerified: true });

  await code.deleteOne();

  return true;
}



export default emailVerification