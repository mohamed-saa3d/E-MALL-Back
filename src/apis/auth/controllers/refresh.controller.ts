import { Request, Response } from "express";
import refreshAccessTokenAndRefreshToken from "../services/refresh.service";
import cookieOptions from "../../../options/cookie-options";


const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const {
    token,
    refreshToken: newRefreshToken,
    user,
  } = await refreshAccessTokenAndRefreshToken(
    refreshToken,
    req.ip,
    (req.headers["user-agent"] as string) || null,
  );

  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  res.status(200).json({
    status: "success",
    token: token,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    },
  });
};

export default refreshToken;
