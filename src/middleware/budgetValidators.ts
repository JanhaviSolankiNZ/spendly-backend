import { body } from "express-validator";
import { EXPENSE_CATEGORIES } from "../utils/constants";

export const upsertBudgetValidation = [
  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(", ")}`),

  body("limit")
    .notEmpty().withMessage("Limit is required")
    .isFloat({ gt: 0 }).withMessage("Limit must be greater than 0")
    .toFloat(),
];