import { Router }  from "express";
import rateLimit    from "express-rate-limit";
import { protect }  from "../middleware/authMiddleware";
import { upsertBudgetValidation } from "../middleware/budgetValidators";
import {
  getBudgets,
  upsertBudget,
  deleteBudget,
  deleteBudgetByCategory,
} from "../controllers/budgetController";

const router = Router();

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

// all budget routes require valid JWT
router.use(protect);

// ── specific paths BEFORE /:id ─────────────────────────────────────────────────
router.delete("/category/:category", writeLimiter, deleteBudgetByCategory);

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.get(   "/",    readLimiter,  getBudgets);
router.post(  "/",    writeLimiter, upsertBudgetValidation, upsertBudget);
router.delete("/:id", writeLimiter, deleteBudget);

export default router;