import { Request, Response, NextFunction } from "express";
import { getStoreDashboard } from "../services/store-stats.service";
import AppError from "../../../utils/app-error";

export const getDashboardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) throw new AppError("Unauthorized", 401);
    // determine store(s) owned by this user
    const Store = require("../models/store.model").default;
    const store = await Store.findOne({ ownerId: user.id });
    if (!store) {
      throw new AppError("You do not own a store", 404);
    }
    const stats = await getStoreDashboard(store._id);
    res.status(200).json({ status: "success", data: stats });
  } catch (err: any) {
    next(err);
  }
};
