import {Router} from "express"
import changePassword from "../controller/change-password.controller";
import authorized from "../../../middlewares/authentication";
import { changePasswordSchema } from "../validation/change-password.validation";
import validate from "../../../middlewares/validate-body.middleware";

const userRouter = Router();

userRouter.use(authorized); //authorized

userRouter.post("/change-password", validate(changePasswordSchema),changePassword);

export default userRouter