import {Router} from "express"
import authorized from "../../../middlewares/authentication";
import changePassword from "../controller/change-password.controller";

const userRouter = Router();

userRouter.use(authorized);

userRouter.post("/change-password", changePassword);

export default userRouter
