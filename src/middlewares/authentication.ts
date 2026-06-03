import mongoose, { ObjectId } from "mongoose";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import { verifyAuthToken, JwtAuthPayload } from "../utils/jwt-verification";
import User, { Role } from "../apis/auth/models/user.model";

const authorized = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError("You are not logged in. Please log in to get access", 401),
      );
    }

    const decoded = verifyAuthToken(token);
    const id = decoded.id;
    const userId = new mongoose.Types.ObjectId(id) as unknown as ObjectId;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return next(
        new AppError(
          "This token is valid but the user account is no longer active or has been deleted. Please log in again.",
          401,
        ),
      );
    }

    req.user = {
      id: userId,
      role: currentUser.role.toLowerCase() as Role,
      email: currentUser.email,
    };
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError("Your session has expired. Please log in again.", 401),
      );
    }
    if (err.name === "JsonWebTokenError") {
      return next(
        new AppError("Your login token is invalid. Please log in again.", 401),
      );
    }
    next(err);
  }
};

export default authorized;
