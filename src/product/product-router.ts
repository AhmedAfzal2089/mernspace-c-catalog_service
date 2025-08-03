import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { ProductController } from "./product-controller";
import { asyncWrapper } from "../common/utils/wrapper";
import createProductValidator from "./create-product-validator";
import { ProductService } from "./productService";
import fileUpload from "express-fileupload";
import { S3Storage } from "../common/services/S3Storage";
import createHttpError from "http-errors";
import updateProductValidator from "./update-product-validator";
import logger from "../config/logger";

const router = express.Router();

// dependency injection
const productService = new ProductService();
const s3Storage = new S3Storage();
const productController = new ProductController(
    productService,
    s3Storage,
    logger,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, //500 kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createProductValidator,
    asyncWrapper(productController.create),
);
router.put(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 }, //500 kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    updateProductValidator,
    asyncWrapper(productController.update),
);
router.get("/", asyncWrapper(productController.index));
router.get("/:productId", asyncWrapper(productController.getSingleProduct));
router.delete("/:productId", asyncWrapper(productController.deleteProduct));

export default router;
