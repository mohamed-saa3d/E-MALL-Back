import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../../utils/app-error";
import { getMyStoreByOwner } from "../services/get-my-store-by-owner.service";

/**
 * GET /stores/my-store - Get owner's store (owner/admin)
 */
export const getMyStoreByOwnerHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const store = await getMyStoreByOwner(userId);

    res.status(200).json({
      status: "success",
      data: { store },
    });
  } catch (err: any) {
    next(err);
  }
};
