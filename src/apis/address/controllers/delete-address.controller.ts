import { RequestHandler, Response } from "express";
import { catchError } from "../../../utils/catch-error";
import { deleteAddress as deleteAddressService } from "../services/delete-address.service";
import { AddressMessageResponse, AddressParams } from "../types/address.types";
import { getAuthenticatedUserId } from "./address-shared.controller";

const deleteAddress: RequestHandler<AddressParams, AddressMessageResponse> =
  catchError<AddressParams, AddressMessageResponse>(
    async (req, res: Response<AddressMessageResponse>) => {
      await deleteAddressService(getAuthenticatedUserId(req), req.params.id);

      res.status(200).json({
        status: "success",
        message: "Address deleted successfully",
      });
    },
  );

export default deleteAddress;
