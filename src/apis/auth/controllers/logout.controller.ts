import { CookieOptions, Request, RequestHandler, Response } from "express";
import environment from "../../../config/environment";
import cookieOptions from "../../../options/cookie-options";
import logoutUser from "../services/logout.service";


const logout: RequestHandler<{}, string> = async (
  req: Request,
  res: Response,
) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(200).json("cookies not found");
  }

  await logoutUser(refreshToken);

  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json("Logout successfully");
};

export default logout;
