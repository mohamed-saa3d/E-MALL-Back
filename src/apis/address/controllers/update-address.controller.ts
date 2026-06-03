import { RequestHandler, Response } from "express";
import { catchError } from "../../../utils/catch-error";
import { updateAddress as updateAddressService } from "../services/update-address.service";
import {
  AddressItemResponse,
  AddressParams,
  UpdateAddressBody,
} from "../types/address.types";
import { getAuthenticatedUserId } from "./address-shared.controller";

const updateAddress: RequestHandler<
  AddressParams,
  AddressItemResponse,
  UpdateAddressBody
> = catchError<AddressParams, AddressItemResponse, UpdateAddressBody>(
  async (req, res: Response<AddressItemResponse>) => {
    const address = await updateAddressService(
      getAuthenticatedUserId(req),
      req.params.id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: {
        address,
      },
    });
  },
);

export default updateAddress;
