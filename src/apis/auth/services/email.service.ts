import nodemailer from "nodemailer";
import environment from "../../../config/environment";

const transporter = nodemailer.createTransport({
  service: environment.EMAIL_HOST,
  auth: {
    user: environment.EMAIL_USER,
    pass: environment.EMAIL_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  await transporter.sendMail({
    from: environment.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
}
