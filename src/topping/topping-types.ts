import { Request } from "express-jwt";
import mongoose from "mongoose";

export interface Topping {
    _id?: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    tenantId: string;
}

export interface CreateToppingRequest extends Request {
    body: Topping;
}
export interface Filter {
    tenantId?: string;
}
export interface PaginateQuery {
    page: number;
    limit: number;
}
