import { RequestHandler, Response } from "express";
import { catchError } from "../../../utils/catch-error";
import { getMyAddresses as getMyAddressesService } from "../services/get-my-addresses.service";
import { AddressListResponse } from "../types/address.types";
import { getAuthenticatedUserId } from "./address-shared.controller";

const getMyAddresses: RequestHandler<{}, AddressListResponse> =
  catchError<{}, AddressListResponse>(
    async (req, res: Response<AddressListResponse>) => {
      const addresses = await getMyAddressesService(getAuthenticatedUserId(req));

      res.status(200).json({
        status: "success",
        data: {
          addresses,
          total: addresses.length,
        },
      });
    },
  );

export default getMyAddresses;
