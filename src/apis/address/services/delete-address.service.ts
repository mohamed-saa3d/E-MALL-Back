import { ObjectId } from "mongoose";
import { getOwnedAddressDocument } from "./address-shared.service";

export const deleteAddress = async (
  userId: ObjectId | string,
  addressId: ObjectId | string,
) => {
  const address = await getOwnedAddressDocument(userId, addressId);
  await address.deleteOne();
};
