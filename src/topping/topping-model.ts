import mongoose, { AggregatePaginateModel } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Topping } from "./topping-types";

const toppingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },

        tenantId: {
            type: String, //to convert string to number is easy (btw in auth service tenId is string)
            required: true,
        },
    },
    { timestamps: true },
);
toppingSchema.plugin(aggregatePaginate);
export default mongoose.model<Topping, AggregatePaginateModel<Topping>>(
    "Topping",
    toppingSchema,
);
