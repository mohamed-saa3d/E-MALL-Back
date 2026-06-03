import { mapStoreResponse } from "../../../utils/response-mappers";
import Store from "../models/store.model";
import { IStoreResponse } from "../types/store.types";
import AppError from "../../../utils/app-error";
import { toObjectId } from "../products/services/shared/to-object-id.util";

const getStoreById = async (storeId: string): Promise<IStoreResponse> => {
  const sid = toObjectId(storeId, "storeId");
    const store = await Store.findById(sid)
      .populate("categoryId", "name slug")
      .populate("ownerId", "name email")
      .lean();
  if (!store) {
    throw new AppError("Store not found", 404);
  }

  return mapStoreResponse(store) as IStoreResponse;
};

export default getStoreById;
