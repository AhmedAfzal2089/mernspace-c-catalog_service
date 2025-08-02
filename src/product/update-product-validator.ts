import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name must be a string"),
    body("description").exists().withMessage("description is required"),
    body("priceConfiguration")
        .exists()
        .withMessage("Price Configuration is required"),
    body("description").exists().withMessage("description is required"),

    body("attributes").exists().withMessage("Attributes fields are required"),
    body("tenantId").exists().withMessage("Tenant ID fields are required"),
    body("categoryId").exists().withMessage("Category  ID fields are required"),
];
