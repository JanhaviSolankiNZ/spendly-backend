import { Router }  from "express";
import rateLimit    from "express-rate-limit";
import { getDashboard } from "../controllers/dashboardController";

const router = Router();

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.get("/", readLimiter, getDashboard);

export default router;