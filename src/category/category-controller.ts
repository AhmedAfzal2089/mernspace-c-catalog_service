import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category, PriceConfiguration } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";

export class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        //when create method is called , it will get its proper contexts

        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.index = this.index.bind(this);
        this.getOne = this.getOne.bind(this);
    }
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;

        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info("Category created successfully", {
            id: category._id,
        });
        res.status(201).json({ id: category._id });
    }
    async index(req: Request, res: Response) {
        const categories = await this.categoryService.getAll();
        this.logger.info(`Getting categories list`);
        res.json(categories);
    }
    async getOne(req: Request, res: Response, next: NextFunction) {
        const { categoryId } = req.params;
        const category = await this.categoryService.getOne(categoryId);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }
        this.logger.info(`Getting category`, { id: category._id });
        res.json(category);
    }
    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const categoryId = req.params.id;
        const updateData = req.body as Partial<Category>;

        // Check if category exists
        const existingCategory = await this.categoryService.getOne(categoryId);

        if (!existingCategory) {
            return next(createHttpError(404, "Category not found"));
        }
        if (updateData.priceConfiguration) {
            const existingConfig = existingCategory.priceConfiguration ?? {};

            const mergedConfig: PriceConfiguration = {
                ...existingConfig,
                ...updateData.priceConfiguration,
            };

            updateData.priceConfiguration = mergedConfig;
        }
        await this.categoryService.update(categoryId, updateData);

        this.logger.info(`Updated category`, { id: categoryId });

        res.json({
            id: categoryId,
        });
    }
}
