import { body, query } from "express-validator";
import { EXPENSE_CATEGORIES } from "../utils/constants";

export const createExpenseValidator = [
    body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({max:200}).withMessage("Description must be under 200 characters"),
    body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({gt:0}).withMessage("Amount must be positive number")
    .toFloat(),
    body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO date")
];

export const listExpenseValidator = [
    query("page")
    .optional()
    .isInt({min:1}).withMessage("Page must be a positive integer")
    .toInt(),
    query("limit")
    .optional()
    .isInt({min:1, max:40}).withMessage("Limit must be between 1 and 40")
    .toInt(),
    query("category")
    .optional()
    .isIn(EXPENSE_CATEGORIES)
    .withMessage("Invalid category"),
    query("month")
    .optional()
    .matches(/^\d{4}-\d{2}$/).withMessage("month must be in YYYY-MM format e.g. 2025-04"),
    query("search")
    .optional()
    .trim()
    .isLength({max:100}).withMessage("Search query is too long"),
    query("sortBy")
    .optional()
    .isIn(["date", "amount", "category", "createdAt"])
    .withMessage("Invalid sort field"),
    query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("SortOrder must be asc or desc")
];

export const updateExpenseValidator = [
    body("description")
    .optional()
    .trim()
    .notEmpty().withMessage("Description cannot be empty")
    .isLength({ max: 200 }).withMessage("Description must be under 200 characters"),

  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number")
    .toFloat(),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO date"),

  body("category")
    .optional()
    .isIn([
      "Essential / Fixed",
      "Lifestyle / Variable",
      "Financial",
      "Work & Education",
      "Social & Family",
      "Miscellaneous",
    ])
    .withMessage("Invalid category")
]