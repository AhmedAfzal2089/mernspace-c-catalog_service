import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { asyncWrapper } from "../common/utils/wrapper";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { ToppingService } from "./topping-service";
import { ToppingController } from "./topping-controller";
import { S3Storage } from "../common/services/S3Storage";
import logger from "../config/logger";
import createToppingValidator from "./create-topping-validator";

const router = express.Router();

// dependency injection
const toppingService = new ToppingService();
const s3storage = new S3Storage();
const toppingController = new ToppingController(
    toppingService,
    logger,
    s3storage,
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
    createToppingValidator,
    asyncWrapper(toppingController.create),
);
router.get("/", asyncWrapper(toppingController.getAllToppings));

export default router;
