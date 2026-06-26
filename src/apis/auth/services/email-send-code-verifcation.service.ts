import AppError from "../../../utils/app-error";
import User from "../models/user.model";
import VerifyTokens from "../models/verify-tokens.model";
import { sendEmail } from "./email.service";
import { createToken } from "./token.service";
import fs from "fs/promises";

async function sendCodeEmailVerification(email: string) {

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 400);
  }

  await VerifyTokens.findOneAndDelete({ userId: user._id, type: "verify" });
  
  const { raw: verifyCode } = await createToken(user._id, "verify", 10);

  // const url = `${BASE_URL}/api/auth/verify-email/${token}`;

  let emailTemplate = await fs.readFile(
    "./src/apis/auth/templates/email.template.html",
    "utf-8",
  );
  emailTemplate = emailTemplate.replace(
    /{{\s*VerifyCode\s*}}/g,
    String(verifyCode),
  );

  console.log(emailTemplate);
  console.log(user.email);

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Please verify your email`,
    html: emailTemplate,
  });
}

export default sendCodeEmailVerification;
