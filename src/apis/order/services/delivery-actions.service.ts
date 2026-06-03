import { ObjectId } from "mongoose";
import AppError from "../../../utils/app-error";
import User, { Role } from "../../auth/models/user.model";
import { getOrderDocument, idsEqual, toOrderObjectId } from "./order-shared.service";
import { updateOrderDeliveryStatus } from "./update-order-delivery-status.service";

const resolveRiderId = async (
  actorId: ObjectId | string,
  actorRole: Role,
  riderId?: ObjectId | string,
) => {
  if (actorRole === Role.ADMIN && riderId) {
    const targetRiderId = toOrderObjectId(riderId, "riderId");
    const rider = await User.findOne({
      _id: targetRiderId,
      role: Role.FULFILLMENT,
      isActive: true,
      deletedAt: null,
    } as any).select("_id");

    if (!rider) {
      throw new AppError("Rider not found", 404);
    }

    return targetRiderId;
  }

  return toOrderObjectId(String(actorId), "userId");
};

const ensureRiderCanAct = async (
  orderId: ObjectId | string,
  actorId: ObjectId | string,
  actorRole: Role,
) => {
  const order = await getOrderDocument(orderId);

  if (actorRole !== Role.ADMIN) {
    if (
      !order.delivery.riderId ||
      !idsEqual(order.delivery.riderId, String(actorId))
    ) {
      throw new AppError("This delivery order is not assigned to you", 403);
    }
  }

  return order;
};

export const assignDeliveryOrder = async (
  orderId: ObjectId | string,
  actorId: ObjectId | string,
  actorRole: Role,
  riderId?: ObjectId | string,
) => {
  const resolvedRiderId = await resolveRiderId(
    String(actorId),
    actorRole,
    riderId,
  );
  return updateOrderDeliveryStatus({
    orderId,
    status: "assigned",
    riderId: resolvedRiderId,
  });
};

export const collectDeliveryOrder = async (
  orderId: ObjectId | string,
  actorId: ObjectId | string,
  actorRole: Role,
) => {
  await ensureRiderCanAct(orderId, String(actorId), actorRole);
  return updateOrderDeliveryStatus({ orderId, status: "collecting" });
};

export const startDeliveryOrder = async (
  orderId: ObjectId | string,
  actorId: ObjectId | string,
  actorRole: Role,
) => {
  await ensureRiderCanAct(orderId, String(actorId), actorRole);
  return updateOrderDeliveryStatus({ orderId, status: "on_the_way" });
};

export const deliverDeliveryOrder = async (
  orderId: ObjectId | string,
  actorId: ObjectId | string,
  actorRole: Role,
) => {
  await ensureRiderCanAct(orderId, String(actorId), actorRole);
  return updateOrderDeliveryStatus({ orderId, status: "delivered" });
};
