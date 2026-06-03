import { ObjectId } from "mongoose";
import Order from "../../order/models/order.model";
import AppError from "../../../utils/app-error";
import { ensureStoreForOwner } from "../products/services/shared/ensure-store-for-owner.util";
import { toObjectId } from "../products/services/shared/to-object-id.util";
import {
  mapOrderResponse,
  mapStoreOrderResponse,
} from "../../../utils/response-mappers";
import { toStoreScopedOrder } from "../../order/services/order-shared.service";

/**
 * Get a single order for a specific store (owner/admin).
 */
export const getMyOrder = async (
  storeId: string,
  orderId: string,
  ownerId: ObjectId | string,
) => {
  const { sid } = await ensureStoreForOwner(storeId, ownerId);
  const oid = toObjectId(orderId, "orderId");

  const order = await Order.findOne({
    _id: oid,
    "stores.storeId": sid as any,
  })
    .populate("userId", "name email")
    .lean();

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return mapStoreOrderResponse(toStoreScopedOrder(order, sid), sid);
};
