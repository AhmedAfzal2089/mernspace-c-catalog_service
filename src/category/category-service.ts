import CategoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new CategoryModel(category);
        return newCategory.save();
    }
    async update(
        categoryId: string,
        updateData: Partial<Category>,
    ): Promise<Category | null> {
        return await CategoryModel.findByIdAndUpdate(
            categoryId,
            {
                $set: updateData, // It replaces only the provided fields, without affecting the rest.
            },
            {
                new: true, //Mongoose will return the updated document instead.
            },
        );
    }
    async getOne(categoryId: string) {
        const category = await CategoryModel.findOne({
            _id: categoryId,
        }).lean();
        return category;
    }
    async getAll() {
        return await CategoryModel.find();
    }
}
