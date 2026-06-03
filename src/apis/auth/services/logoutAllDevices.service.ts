import mongoose from "mongoose";
import LoginSession from "../models/loginSession.model";

const logoutAllDevices = async (userId: mongoose.Types.ObjectId | string) => {
  const userid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  await LoginSession.updateMany(
    { userId: userid, revokedAt: null } as any,
    { $set: { revokedAt: new Date() } },
  );
};

export default logoutAllDevices;
