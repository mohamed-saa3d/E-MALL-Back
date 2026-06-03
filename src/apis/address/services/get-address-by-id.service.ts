import { ObjectId } from "mongoose";
import { mapAddressResponse } from "../../../utils/response-mappers";
import { getOwnedAddressDocument } from "./address-shared.service";

export const getAddressById = async (
  userId: ObjectId | string,
  addressId: ObjectId | string,
) => {
  const address = await getOwnedAddressDocument(userId, addressId);
  return mapAddressResponse(address.toObject());
};
