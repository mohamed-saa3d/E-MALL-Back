import environment from "../../../config/environment";
import bcrypt from "bcrypt";
import AppError from "../../../utils/app-error";
import User from "../models/user.model";
import createAuthTokens from "../../../utils/auth-tokens";
import LoginSession from "../models/loginSession.model";
import Cart from "../../cart/models/cart.model";
import WishList from "../../wish-list/models/wish-list.model";

import mongoose from "mongoose";
import hashRefreshToken from "../../../utils/hash-refresh-token";

const registerUser = async (
  email: string,
  password: string,
  name: string,
  ip?: string | null,
  userAgent?: string | null,
) => {
  const sessionDb = await mongoose.startSession();
  try {
    let createdUser: any = null;
    let createdSession: any = null;
    let createdCart: any = null;
    let createdWishList: any = null;

    let tokenResult: any = null;

    await sessionDb.withTransaction(async () => {
      const isUserExists = await User.findOne({ email }).session(sessionDb);
      if (isUserExists?.isActive === true) {
        throw new AppError("User already exists", 400);
      }
      if (isUserExists?.isActive === false) {
        throw new AppError(
          "User is deactivated please login and reset your password to reactivate your account",
          400,
        );
      }

      const hashPassword = await bcrypt.hash(password, environment.BCRYPT_SALT);

      createdUser = await new User({ email, hashPassword, name }).save({ session: sessionDb });

      const userId = createdUser._id;
      const { token, refreshToken, expiresAt } = await createAuthTokens(userId);

      const hashedRefreshToken = hashRefreshToken(refreshToken);

      createdSession = await new LoginSession({
        refreshToken: hashedRefreshToken,
        expiresAt,
        userId: userId,
        ip: ip || null,
        userAgent: userAgent || null,
        lastUsedAt: new Date(),
      }).save({ session: sessionDb });

      createdCart = await new Cart({ userId: createdUser._id }).save({ session: sessionDb });

      createdWishList = await new WishList({ userId: createdUser._id }).save({ session: sessionDb });

      // expose token details outside transaction
      tokenResult = { token, refreshToken, expiresAt };
    
    });



    
    const result = tokenResult || {};

    sessionDb.endSession();

    return {
      token: result.token,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
      user: createdUser,
      session: createdSession,
    };
  } catch (error: any) {
    sessionDb.endSession();
    throw error;
  }
};

export default registerUser;
