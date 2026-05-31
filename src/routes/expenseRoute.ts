import express from "express";
const rateLimiter = require("express-rate-limit");
import { addExpense, createExpenseSummary, deleteExpense, getCategoryWithAI, listExpenses, updateExpense } from "../controllers/expenseController";
import { createExpenseValidator, listExpenseValidator, updateExpenseValidator } from "../middleware/expenseValidators";

const readLimiter = rateLimiter({
    windowMs: 15*60*1000,
    max:200,
    message: {success: false, message: "Too many requests, please try again later."},
    standardHeaders: true,
    legacyHeaders: false
});

const writeLimiter = rateLimiter({
    windowMs: 15*60*1000,
    max:60,
    message: {success: false, message: "Too many requests, please try again later."},
    standardHeaders: true,
    legacyHeaders: false
});


const router = express.Router();

router.post("/categorise", getCategoryWithAI);
router.post("/", writeLimiter, createExpenseValidator, addExpense);
router.patch("/:expenseId", writeLimiter, updateExpenseValidator, updateExpense);
router.delete("/:expenseId", writeLimiter, deleteExpense);
router.get("/", readLimiter, listExpenseValidator, listExpenses);
router.get("/analytics/summary", readLimiter, createExpenseSummary);
export default router;