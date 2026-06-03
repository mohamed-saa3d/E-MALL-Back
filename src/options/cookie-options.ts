import { CookieOptions } from "express";
import environment from "../config/environment";

  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + +environment.REFRESH_TOKEN_EXPIRES), // 15 days from now
    httpOnly: true,
    sameSite: "strict",
    secure: environment.NODE_ENV === "production",
  };

export default cookieOptions