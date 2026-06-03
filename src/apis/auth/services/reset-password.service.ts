import AppError from "../../../utils/app-error";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { findActiveTokenByRaw, markTokenUsed } from "./token.service";
import environment from "../../../config/environment";

const resetPassword = async (
  raw: string,
  newPassword: string,
  confirmNewPassword: string,
) => {
  const tokenDoc = await findActiveTokenByRaw(raw, "reset");

  // if (!tokenDoc) throw new AppError("Invalid or expired token", 400);

  const user = await User.findById(tokenDoc.userId);

  if (!user) throw new AppError("User not found", 400);

  if (newPassword !== confirmNewPassword)
    throw new AppError("New password and confirm password do not match", 400);

  const hashedPassword = await bcrypt.hash(
    newPassword,
    environment.BCRYPT_SALT,
  );

  await user.updateOne({ hashPassword: hashedPassword });

  await markTokenUsed(tokenDoc._id);

  await tokenDoc.deleteOne();

  return true;
};

export default resetPassword;
