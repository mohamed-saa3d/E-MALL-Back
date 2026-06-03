import crypto from "crypto";
const hashWithCrypto = (theStringWeWantToHash: string) => {
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(theStringWeWantToHash)
    .digest("hex");
  return hashedRefreshToken;
};

export default hashWithCrypto;
