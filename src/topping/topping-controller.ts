/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "winston";
import { NextFunction, Response } from "express";
import { CreateToppingRequest, Topping } from "./topping-types";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { ToppingService } from "./topping-service";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private logger: Logger,
        private storage: FileStorage,
    ) {}
    create = async (
        req: CreateToppingRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        try {
            const topping = req.body;
            const image = req.files!.image as UploadedFile;
            const fileUuid = uuidv4();
            await this.storage.upload({
                filename: fileUuid,
                fileData: image.data.buffer,
            });
            const savedTopping = await this.toppingService.create({
                ...topping,
                image: fileUuid,
                tenantId: req.body.tenantId,
            } as Topping);
            res.json({ id: savedTopping._id });
            this.logger.info("Product Created");
        } catch (err) {
            return next(err);
        }
    };
}
