import express from "express";
import { CategoryController } from "./category-controller";
import { CategoryService } from "./category-service";
import logger from "../config/logger";
import categoryValidator from "./category-validator";

const router = express.Router();
// dependency injection
const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

router.post("/", categoryValidator, categoryController.create);

export default router;
