import { Request } from "express";
import AppError from "../../../utils/app-error";

export const getAuthenticatedUserId = (req: Request) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  return userId;
};
