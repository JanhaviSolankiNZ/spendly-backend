import { Router } from "express";
import express from "express";
import { stripeWebhook } from "../controllers/subscriptionController";
const router = Router();

// ── Webhook — MUST come before protect middleware
// Stripe sends raw body — express.json() must NOT run on this route

router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // raw body for signature verification
  stripeWebhook,
);

export default router;