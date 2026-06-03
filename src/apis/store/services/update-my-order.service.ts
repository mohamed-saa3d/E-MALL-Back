import { ObjectId } from "mongoose";
import { updateOrderStoreStatus } from "../../order/services/update-order-store-status.service";
import { UpdateStoreOrderInput } from "../validations/store-order.validation";

/**
 * Update a store section inside an order (owner/admin).
 */
export const updateMyOrder = async (
  storeId: string,
  orderId: string,
  ownerId: ObjectId | string,
  updates: UpdateStoreOrderInput,
) => {
  return updateOrderStoreStatus({
    storeId,
    orderId,
    ownerId: ownerId as any,
    status: updates.status,
    rejectionReason: updates.rejectionReason,
    missingItems: updates.missingItems,
  });
};
