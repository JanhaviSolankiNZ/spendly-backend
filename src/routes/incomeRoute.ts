import express from "express";
import rateLimit from "express-rate-limit";
import { createIncomeValidator, listIncomeValidator, updateIncomeValidator } from "../middleware/incomeValidators";
import { addIncome, deleteIncome, getIncomes, getIncomeSummary, updateIncome } from "../controllers/incomeController";

const router = express.Router();

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      60,
  message:  { success: false, message: "Too many write requests, please slow down." },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.post("/",  writeLimiter, createIncomeValidator, addIncome);
router.patch("/:incomeId", writeLimiter, updateIncomeValidator, updateIncome)
router.delete("/:incomeId", writeLimiter, deleteIncome);
router.get("/summary", readLimiter, getIncomeSummary);
router.get("/", readLimiter, listIncomeValidator, getIncomes);
export default router;