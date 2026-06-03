import Store from "../models/store.model";
import AppError from "../../../utils/app-error";
import { IStoreResponse } from "../types/store.types";
import { mapStoreResponse } from "../../../utils/response-mappers";

/**
 * Get all active stores (for users)
 * Only shows active stores
 */
export const getAllActiveStores = async (): Promise<IStoreResponse[]> => {
  try {
    const stores = await Store.find({ isActive: true , deletedAt: null})
      .populate("categoryId", "name slug")
      .sort({ name: 1 })
      .lean();
    return stores.map((store) => mapStoreResponse(store)) as IStoreResponse[];
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get all stores with filter option (for admin)
 * Can filter by isActive status or show all
 */
export const getAllStoresAdmin = async (
  filterByActive?: boolean,
): Promise<IStoreResponse[]> => {
  try {
    let query:any = {deletedAt: null};

    if (filterByActive === true|| !filterByActive) {
      query.isActive = true;
    } else if (filterByActive === false) {
      query.isActive=false;
    }

    const stores = await Store.find()
      .populate("categoryId", "name slug")
      .populate("ownerId", "name email")
      .sort({ name: 1 })
      .lean();
    console.log(stores); ///
    return stores.map((store) => mapStoreResponse(store, { includeOwner: true })) as IStoreResponse[];
  } catch (error: any) {
    throw error;
  }
};
