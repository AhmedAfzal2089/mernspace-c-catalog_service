import express from "express";
import { CategoryController } from "./category-controller";

const router = express.Router();

const categoryController = new CategoryController();

router.post("/", categoryController.create);

export default router;
