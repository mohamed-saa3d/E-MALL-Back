import { NextFunction, Request, RequestHandler, Response } from "express";
import { IRequestUser, IResponseUser } from "../types/register.types";
import registerUser from "../services/register.service";
import AppError from "../../../utils/app-error";
import cookieOptions from "../../../options/cookie-options";


const register: RequestHandler<{}, IResponseUser/*, IRequestUser*/> = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name , phoneNumber} = req.body;

    if (!email || !password || !name) {
      throw new AppError("Missing required fields", 400);
    }

    const user = await registerUser(
      email,
      password,
      name,
      phoneNumber,
      req.ip,
      (req.headers["user-agent"] as string) || null,
    );

    res.cookie("refreshToken", user.refreshToken, cookieOptions);

    res.status(200).json({
      status: "success",
      token: user.token,
      data: {
        user: {
          id: user.user.id,
          name: user.user.name,
          email: user.user.email,
        },
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export default register;
