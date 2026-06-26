import AppError from "../../../utils/app-error";
import User from "../models/user.model";
import { emailForgetPassword } from "./email-forgot-password.service";
import { createToken } from "./token.service";

 const requestPasswordReset = async (email: string) => {
     
 const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 400);
  }
  const {raw}= await createToken(user._id,'reset', 30);

  await emailForgetPassword(email,raw);
 }

 export default requestPasswordReset