import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import { mapAddressResponse } from "../../../utils/response-mappers";
import Address from "../model/address.model";
import { toObjectId } from "./address-shared.service";

export const getDefaultAddress = async (userId: ObjectId | string) => {
  const uid = toObjectId(userId, "user id");
  const address = await Address.findOne({ userId: uid, isDefault: true } as any).lean();

  if (!address) {
    throw new AppError("This user does not have a default address", 404);
  }

  return mapAddressResponse(address);
};
