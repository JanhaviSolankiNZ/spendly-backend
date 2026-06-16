import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
} from "../controllers/subscriptionController";

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


router.post("/create-checkout-session", limiter, createCheckoutSession);
router.post("/create-portal-session", limiter, createPortalSession);
router.get("/subscription", limiter, getSubscription);

export default router;
