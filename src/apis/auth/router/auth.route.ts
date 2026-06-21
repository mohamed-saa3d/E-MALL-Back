import { Router } from "express";
import register from "../controllers/register.controller";
import login from "../controllers/login.controller";
import validate from "../../../middlewares/validate-body.middleware";
import { loginSchema } from "../validations/login.validation";
import { registerSchema } from "../validations/register.validation";
import refreshToken from "../controllers/refresh.controller";
import logout from "../controllers/logout.controller";
// import verifyEmail from "../controllers/verify.controller";
import forgotPassword from "../controllers/forgot.controller";
import resetPassword from "../controllers/reset-password.controller";
import forgotPasswordSchema from "../validations/forgot-password.validation";
import emailVerification from "../controllers/email-verification.controller";

import { authSensitiveLimiter, refreshLimiter } from "../../../middlewares/auth-rate-limit";
import sendCodeEmailVerification from "../controllers/email-send-code-verification.controller";

const authRouter = Router();

authRouter.post("/register", /*authSensitiveLimiter ,*/ validate(registerSchema), register);
authRouter.post("/login", /*authSensitiveLimiter,*/ validate(loginSchema), login);
authRouter.post("/refresh", refreshLimiter, refreshToken);
authRouter.get("/logout",/* authSensitiveLimiter,*/ logout);
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  "/reset-password/:token",
    // validate with quickValidate middleware
  resetPassword,
);


authRouter.post("/send-code-email-verification", sendCodeEmailVerification);

authRouter.patch("/email-verification", emailVerification);

// authRouter.get("/verify-token/:token", verifyToken);

export default authRouter;
