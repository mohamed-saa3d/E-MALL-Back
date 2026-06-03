import { RequestHandler, Response } from "express";
import { catchError } from "../../../utils/catch-error";
import { getDefaultAddress as getDefaultAddressService } from "../services/get-default-address.service";
import { AddressItemResponse } from "../types/address.types";
import { getAuthenticatedUserId } from "./address-shared.controller";

const getDefaultAddress: RequestHandler<{}, AddressItemResponse> =
  catchError<{}, AddressItemResponse>(
    async (req, res: Response<AddressItemResponse>) => {
      const address = await getDefaultAddressService(getAuthenticatedUserId(req));

      res.status(200).json({
        status: "success",
        data: {
          address,
        },
      });
    },
  );

export default getDefaultAddress;
