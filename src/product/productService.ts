import { paginationLabels } from "../config/pagination";
import productModel from "./product-model";
import { Filter, PaginateQuery, Product } from "./product-types";

export class ProductService {
    async createProduct(product: Product): Promise<Product | null> {
        return (await productModel.create(product)) as Product;
    }

    async updateProduct(
        productId: string,
        product: Product,
    ): Promise<Product | null> {
        return await productModel.findOneAndUpdate(
            { _id: productId },
            {
                $set: product,
            },
            {
                new: true,
            },
        );
    }
    async getProduct(productId: string): Promise<Product | null> {
        return await productModel.findOne({ _id: productId });
    }
    async getProducts(
        q: string,
        filters: Filter,
        paginateQuery: PaginateQuery,
    ) {
        // logic for filters in mongodb
        const searchQueryRegexp = new RegExp(q, "i"); // i for case insensitive
        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };
        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                //connecting categories to product, because we need name of it
                $lookup: {
                    from: "categories", //from which
                    localField: "categoryId", // where to add it
                    foreignField: "_id", // foreigin key(categoryId is which field in categories)
                    as: "category", //which name have to give it
                    // the fields we need is written in pipeline
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                // this will send data as a single object not in array
                $unwind: "$category",
            },
        ]);
        return productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }
    async deleteProduct(productId: string) {
        return await productModel.deleteOne({ _id: productId });
    }
}
