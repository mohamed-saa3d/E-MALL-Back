import { RequestHandler, Response } from "express";
import { catchError } from "../../../utils/catch-error";
import { setDefaultAddress as setDefaultAddressService } from "../services/set-default-address.service";
import {
  AddressItemResponse,
  AddressParams,
  SetDefaultAddressBody,
} from "../types/address.types";
import { getAuthenticatedUserId } from "./address-shared.controller";

const setDefaultAddress: RequestHandler<
  AddressParams,
  AddressItemResponse,
  SetDefaultAddressBody
> = catchError<AddressParams, AddressItemResponse, SetDefaultAddressBody>(
  async (req, res: Response<AddressItemResponse>) => {
    const address = await setDefaultAddressService(
      getAuthenticatedUserId(req),
      req.params.id,
      req.body.isDefault,
    );

    res.status(200).json({
      status: "success",
      data: {
        address,
      },
    });
  },
);

export default setDefaultAddress;
