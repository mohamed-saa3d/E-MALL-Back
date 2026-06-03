import { Router } from "express";
import authorized from "../../../middlewares/authentication";
import validate from "../../../middlewares/validate-body.middleware";
import createAddress from "../controllers/create-address.controller";
import deleteAddress from "../controllers/delete-address.controller";
import getAddressById from "../controllers/get-address-by-id.controller";
import getDefaultAddress from "../controllers/get-default-address.controller";
import getMyAddresses from "../controllers/get-my-addresses.controller";
import setDefaultAddress from "../controllers/set-default-address.controller";
import updateAddress from "../controllers/update-address.controller";
import {
  createAddressSchema,
  setDefaultAddressSchema,
  updateAddressSchema,
} from "../validations/address.validation";

const addressRouter = Router();

addressRouter.use(authorized);

addressRouter.get("/", getMyAddresses);
addressRouter.get("/default", getDefaultAddress);
addressRouter.get("/:id", getAddressById);
addressRouter.post("/", validate(createAddressSchema), createAddress);
addressRouter.patch("/:id", validate(updateAddressSchema), updateAddress);
addressRouter.patch(
  "/:id/default",
  validate(setDefaultAddressSchema),
  setDefaultAddress,
);
addressRouter.delete("/:id", deleteAddress);

export default addressRouter;
