import { NextFunction, Request, RequestHandler, Response } from "express";

import cookieOptions from "../../../options/cookie-options";
import { IRequestUser, IResponseUser } from "../types/register.types";
import AppError from "../../../utils/app-error";
import loginUser from "../services/login.service";


const login: RequestHandler<{}, IResponseUser, IRequestUser, {}, {}> = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Missing required fields", 400);
    }
    const user = await loginUser(
      email,
      password,
      req.ip,
      (req.headers["user-agent"] as string) || null,
    );
    res.cookie("refreshToken", user.refreshToken, cookieOptions);
    res.status(201).json({
      status: "success",
      token: user.token,
      data: {
        user: {
          id: user.user.id,
          name: user.user.name,
          email: user.user.email,
          phoneNumber: user.user.phoneNumber,
        },
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export default login;
