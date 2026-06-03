import { NextFunction, Request, RequestHandler, Response } from "express";
import getStoreByIdService from "../services/get-store-by-id.service";
import { create } from "domain";

export const getStoreByIdHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeIdParam = req.params.storeId;
    const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;

    const store = await getStoreByIdService(storeId);

    res.status(200).json({
      status: "success",
      data: {
      //  name: store.name,
      //  open: store.openingTime,
      //  close: store.closingTime,
      //  createdAt: store.createdAt
        store
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export default getStoreByIdHandler;
