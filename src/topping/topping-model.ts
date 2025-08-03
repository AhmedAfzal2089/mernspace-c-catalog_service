import mongoose from "mongoose";

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
export default mongoose.model("Topping", toppingSchema);
