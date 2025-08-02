import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { ProductService } from "./productService";
import { CreateProductRequest, Product } from "./product-types";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";
import { Request } from "express-jwt";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: FileStorage, // dependency inversion
    ) {
        // if we use arrow function then we dont have to bind here..
    }
    create = async (
        req: CreateProductRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const result = validationResult(req);
        if (!result.isEmpty) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            filename: imageName,
            fileData: image.data,
        });

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;
        const products = {
            name,
            description,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            priceConfiguration: JSON.parse(priceConfiguration),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublish,
            image: imageName,
        };
        const newProduct = await this.productService.createProduct(
            products as unknown as Product,
        );
        res.json({ id: newProduct._id });
    };
    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { productId } = req.params;
        const product = await this.productService.getProduct(productId);
        if (!product) {
            return next(createHttpError(400, "Product not Found"));
        }
        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;
            if (product.tenantId !== String(tenant)) {
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
            oldImage = await this.productService.getProductImage(productId);
            const image = req.files.image as UploadedFile;
            imageName = uuidv4();
            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });
            await this.storage.delete(oldImage!);
        }
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body;
        const productToUpdate = {
            name,
            description,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            priceConfiguration: JSON.parse(priceConfiguration),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublish,
            image: imageName ? imageName : (oldImage as string),
        };
        await this.productService.updateProduct(productId, productToUpdate);
        res.json({ id: productId });
    };
}
