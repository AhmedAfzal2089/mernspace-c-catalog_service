import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { ProductController } from "./product-controller";
import { asyncWrapper } from "../common/utils/wrapper";
import createProductValidator from "./create-product-validator";
import { ProductService } from "./productService";
import fileUpload from "express-fileupload";

const router = express.Router();

// dependency injection
const productService = new ProductService();
const productController = new ProductController(productService);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload(),
    createProductValidator,
    asyncWrapper(productController.create),
);
router.patch("/:id");

export default router;
