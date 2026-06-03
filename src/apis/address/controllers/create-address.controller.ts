import { RequestHandler, Response } from "express";
import { catchError } from "../../../utils/catch-error";
import { createAddress as createAddressService } from "../services/create-address.service";
import {
  AddressItemResponse,
  CreateAddressBody,
} from "../types/address.types";
import { getAuthenticatedUserId } from "./address-shared.controller";

const createAddress: RequestHandler<{}, AddressItemResponse, CreateAddressBody> =
  catchError<{}, AddressItemResponse, CreateAddressBody>(
    async (req, res: Response<AddressItemResponse>) => {
      const address = await createAddressService(
        getAuthenticatedUserId(req),
        req.body,
      );

      res.status(201).json({
        status: "success",
        data: {
          address,
        },
      });
    },
  );

export default createAddress;
