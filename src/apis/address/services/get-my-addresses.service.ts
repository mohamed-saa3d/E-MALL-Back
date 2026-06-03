import { ObjectId } from "mongoose";
import { mapAddressResponse } from "../../../utils/response-mappers";
import Address from "../model/address.model";
import { toObjectId } from "./address-shared.service";

export const getMyAddresses = async (userId: ObjectId | string) => {
  const uid = toObjectId(userId, "user id");

  const addresses = await Address.find({ userId: uid } as any)
    .sort({ isDefault: -1, updatedAt: -1 })
    .lean();

  return addresses.map(mapAddressResponse);
};
