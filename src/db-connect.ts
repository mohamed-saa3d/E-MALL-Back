import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.MONGODB_URI!;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("Connected successfully to database");
  } catch (err) {
    console.error("Connection error:", err);
  }
}
export default connectDB;
