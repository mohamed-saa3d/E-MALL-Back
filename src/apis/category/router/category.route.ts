import { Router } from "express";
import validate from "../../../middlewares/validate-body.middleware";
import authorized from "../../../middlewares/authentication";
import { isAuthorized } from "../../../middlewares/authorized";
import { Role } from "../../auth/models/user.model";
import {
  createCategorySchema,
  updateCategorySchema,
  replaceCategorySchema,
} from "../validations/category.validation";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategoryHandler,
  replaceCategoryHandler,
  getCategoryUsage,
  deleteCategory,
} from "../controllers/category.controller";

const categoryRouter = Router();

/**
 * Public routes (no auth required)
 */
categoryRouter.get("/", listCategories);

/**
 * Specific routes (before :id routes)
 */
categoryRouter.get("/:id/usage", getCategoryUsage);

/**
 * Generic routes by ID
 */
categoryRouter.get("/:id", getCategory);

/**
 * Admin only routes
 */
categoryRouter.post(
  "/",
  authorized,
  isAuthorized(Role.ADMIN),
  validate(createCategorySchema),
  createCategory,
);

categoryRouter.patch(
  "/:id",
  authorized,
  isAuthorized(Role.ADMIN),
  validate(updateCategorySchema),
  updateCategoryHandler,
);

categoryRouter.post(
  "/:id/replace",
  authorized,
  isAuthorized(Role.ADMIN),
  validate(replaceCategorySchema),
  replaceCategoryHandler,
);

categoryRouter.delete(
  "/:id",
  authorized,
  isAuthorized(Role.ADMIN),
  deleteCategory,
);

export default categoryRouter;
