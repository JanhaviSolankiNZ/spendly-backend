import { Router }  from "express";
import rateLimit    from "express-rate-limit";
import { protect }  from "../middleware/authMiddleware";
import {
  getAnalyticsSummary,
  getSixMonthTrend
} from "../controllers/analyticsController";

const router = Router();

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// all analytics routes require valid JWT
router.use(protect);

router.get("/summary", readLimiter, getAnalyticsSummary);
router.get("/trend",   readLimiter, getSixMonthTrend);

export default router;