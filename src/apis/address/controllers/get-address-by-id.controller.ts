import { RequestHandler, Response } from "express";
import { catchError } from "../../../utils/catch-error";
import { getAddressById as getAddressByIdService } from "../services/get-address-by-id.service";
import { AddressItemResponse, AddressParams } from "../types/address.types";
import { getAuthenticatedUserId } from "./address-shared.controller";

const getAddressById: RequestHandler<AddressParams, AddressItemResponse> =
  catchError<AddressParams, AddressItemResponse>(
    async (req, res: Response<AddressItemResponse>) => {
      const address = await getAddressByIdService(
        getAuthenticatedUserId(req),
        req.params.id,
      );

      res.status(200).json({
        status: "success",
        data: {
          address,
        },
      });
    },
  );

export default getAddressById;
