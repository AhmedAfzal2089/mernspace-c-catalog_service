import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./productService";
import { CreateProductRequest, Product } from "./product-types";

export class ProductController {
    constructor(private productService: ProductService) {
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
            image: "image.jpeg",
        };
        const newProduct = await this.productService.createProduct(
            products as unknown as Product,
        );
        res.json({ id: newProduct._id });
    };
}
