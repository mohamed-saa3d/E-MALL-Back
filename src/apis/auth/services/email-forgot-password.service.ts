import { sendEmail } from "./email.service";
import fs from "fs/promises";
import environment from "../../../config/environment";

export async function emailForgetPassword(email: string, token: string) {
  // const decoded = <UserToken>jwt.verify(token, environment.JWT_SECRET_KEY!);
  const resetUrl = `${process.env.BASE_URL || `http://localhost:${environment.PORT}`}/auth/reset-password/${token}`;

  let emailTemplate = await fs.readFile(
    "./src/apis/auth/templates/email-forget-password.html",
    "utf-8",
  );
  emailTemplate = emailTemplate.replace(
    /{{\s*RESET_URL\s*}}/g,
    String(resetUrl),
  );
  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: `Use this link to reset your password: ${resetUrl}`,
    html: emailTemplate,
  });
}
