import jwt from "jsonwebtoken"
import { ObjectId } from "mongoose";
const generateToken = (id: ObjectId,secretKey : string,JWT_EXPIRES:string): string => {

  return jwt.sign({ id }, secretKey as string, {
    expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
  });
};

export default generateToken;