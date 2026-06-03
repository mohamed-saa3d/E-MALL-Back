import { NextFunction, Request, RequestHandler, Response } from "express";
import { IRequestStore, IResponseStore } from "../types/create-store.types";
import createNewStore from "../services/create-sotre.service";
import AppError from "../../../utils/app-error";

const createStore: RequestHandler<{}, IResponseStore, IRequestStore> = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    console.log(req.body);
    if (!data.name || !data.email)
      throw new AppError("Missing required fields", 400);

    if (
      (data.categoryId && data.categoryName) ||
      (!data.categoryId && !data.categoryName)
    )
    
      throw new AppError(
        "Please provide either category id or category name",
        400,
      );

    const store = await createNewStore(data);
    res.status(201).json({
      status: "success",
      message: "Store created successfully",
      data: { store },
    });
  } catch (err: any) {
    next(err);
  }
};

export default createStore;
