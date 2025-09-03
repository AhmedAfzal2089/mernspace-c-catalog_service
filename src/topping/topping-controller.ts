/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "winston";
import { NextFunction, Request as SimpleRequest, Response } from "express";
import { CreateToppingRequest, Filter, Topping } from "./topping-types";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { ToppingService } from "./topping-service";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Request } from "express-jwt";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";

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
                fileData: image.data,
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
    getAllToppings = async (req: SimpleRequest, res: Response) => {
        const { q, tenantId } = req.query;
        const filters: Filter = {};
        if (tenantId) {
            filters.tenantId = tenantId as string;
        }
        const toppings = await this.toppingService.getAll(
            q as string,
            filters,
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        );
        if (!toppings) {
            this.logger.error("Error in Fetching the products");
        }
        const finalToppings = (toppings.data as Topping[]).map(
            (topping: Topping) => {
                return {
                    ...topping,
                    image: this.storage.getObjectUri(topping.image),
                };
            },
        );
        res.json({
            data: finalToppings,
            total: toppings.total,
            pageSize: toppings.limit,
            currentPage: toppings.page,
        });
    };
    getOne = async (req: SimpleRequest, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;
        const topping = await this.toppingService.getOne(toppingId);
        if (!topping) {
            return next(createHttpError(400, "Topping not Found "));
        }
        topping.image = this.storage.getObjectUri(topping.image);
        res.json(topping);
    };
    deleteOne = async (req: Request, res: Response, next: NextFunction) => {
        const { toppingId } = req.params;
        const topping = await this.toppingService.getOne(toppingId);
        if (!topping) {
            return next(createHttpError(400, "Error in Deleting the topping"));
        }
        await this.storage.delete(topping.image);
        await this.toppingService.delete(toppingId);
        res.json(true);
    };
    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { toppingId } = req.params;
        const topping = await this.toppingService.getOne(toppingId);
        if (!topping) {
            return next(createHttpError(400, "topping not found"));
        }
        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;
            if (topping.tenantId !== String(tenant)) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product ",
                    ),
                );
            }
        }
        let imageName: string | undefined;
        let oldImage: string | undefined;
        if (req.files?.image) {
            oldImage = topping.image;
            const image = req.files.image as UploadedFile;
            imageName = uuidv4();
            await this.storage.upload({
                filename: imageName,
                fileData: image.data,
            });
            await this.storage.delete(oldImage);
        }
        const { name, price, image, tenantId } = req.body;
        const updateTopping = {
            name,
            price,
            image: imageName ? imageName : (oldImage as string),
            tenantId,
        };
        await this.toppingService.updateTopping(toppingId, updateTopping);
        res.json({
            id: toppingId,
        });
    };
}
