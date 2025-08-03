import { paginationLabels } from "../config/pagination";
import toppingModel from "./topping-model";
import { Filter, PaginateQuery, Topping } from "./topping-types";

export class ToppingService {
    async create(topping: Topping) {
        return (await toppingModel.create(topping)) as Topping;
    }
    async getAll(q: string, filter: Filter, paginateQuery: PaginateQuery) {
        const searchQueryRegexp = new RegExp(q, "i");
        const matchQuery = {
            ...filter,
            name: searchQueryRegexp,
        };
        const aggregate = toppingModel.aggregate([
            {
                $match: matchQuery,
            },
        ]);
        return toppingModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }
}
