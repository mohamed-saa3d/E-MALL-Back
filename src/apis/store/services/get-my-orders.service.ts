import Order from "../../order/models/order.model";
import mongoose, { ObjectId } from "mongoose";
import { ensureStoreForOwner } from "../products/services/shared/ensure-store-for-owner.util";
import {
  mapOrderResponse,
  mapStoreOrderResponse,
} from "../../../utils/response-mappers";
import { toStoreScopedOrder } from "../../order/services/order-shared.service";

/**
 * Get orders for a specific store (owner only)
 */
export const getMyOrders = async (
  storeId: ObjectId | string,
  ownerId: ObjectId | string,
): Promise<any[]> => {
  try {
    const { sid } = await ensureStoreForOwner(String(storeId), ownerId);
    const orders = await Order.find({
      "stores.storeId": sid as any,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((order) =>
      // produce a strict store-scoped view (no global sensitive fields)
      mapStoreOrderResponse(toStoreScopedOrder(order, sid), sid),
    );
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get order count by store (for stats)
 */
export const getOrderCount = async (
  storeId: ObjectId | string,
): Promise<number> => {
  try {
    const objectId =
      typeof storeId === "string"
        ? new mongoose.Types.ObjectId(storeId)
        : storeId;
    const count = await Order.countDocuments({
      "stores.storeId": objectId as any,
    });

    return count;
  } catch (error: any) {
    throw error;
  }
};
