// import AppError from "../../../utils/app-error";
// import hashWithCrypto from "../../../utils/hash-with-crypto";
// import { findActiveTokenByRaw } from "./token.service";

// const verifyToken = async (token: string) => {
    
//     const tokenDoc = await findActiveTokenByRaw(token, "reset");
//     if (!tokenDoc) throw new AppError("Invalid or expired token", 400);

//     await tokenDoc.updateOne({ verifiedAt: new Date() });
// };

// export default verifyToken;