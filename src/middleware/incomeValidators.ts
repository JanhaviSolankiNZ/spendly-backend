import { body, query } from "express-validator";
import { INCOME_TYPES } from "../models/Income";

export const createIncomeValidator = [
    body("source")
    .trim()
    .notEmpty().withMessage("Source / description is required")
    .isLength({max: 200}).withMessage("Source must be under 200 characters"),
    body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({gt:0}).withMessage("Amount must be greater than 0")
    .toFloat(),
    body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO date"),
    body("incomeType")
    .optional()
    .isIn(INCOME_TYPES)
    .withMessage(`Income type must be one of:${INCOME_TYPES.join(", ")}`),
    body("notes")
    .optional()
    .trim()
    .isLength({max:500}).withMessage("Notes must ne under 500 characters")
];

export const updateIncomeValidator = [
    body("source")
    .optional()
    .trim()
    .notEmpty().withMessage("Source / description is required")
    .isLength({max: 200}).withMessage("Source must be under 200 characters"),
    body("amount")
    .optional()
    .isFloat({gt:0}).withMessage("Amount must be greater than 0")
    .toFloat(),
    body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO date"),
    body("incomeType")
    .optional()
    .isIn(INCOME_TYPES)
    .withMessage(`Income type must be one of:${INCOME_TYPES.join(", ")}`),
    body("notes")
    .optional()
    .trim()
    .isLength({max:500}).withMessage("Notes must ne under 500 characters")
];

export const listIncomeValidator = [
    query("month")
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("Month must be in YYYY-MM format e.g. 2025-04"),

    query("page")
    .optional()
    .isInt({min: 1}).withMessage("Page must be a positive integer")
    .toInt(),

    query("limit")
    .optional()
    .isInt({min:1, max: 100}).withMessage("Limit must be between 1 and 100")
    .toInt()
]