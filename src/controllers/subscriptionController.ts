import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import {
  createCheckoutSessionService,
  createPortalSessionService,
  getSubscriptionService,
  handleWebhookService,
} from "../services/subscriptionService";

// called when user clicks "Start free trial" on pricing page
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const data = await createCheckoutSessionService(req.user!.id);
    sendSuccess(res, data, "Checkout session created", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 400);
    sendError(res, "Something went wrong", 500);
  }
};

// opens Stripe's customer portal — user can cancel, update card etc
export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const data = await createPortalSessionService(req.user!.id);
    sendSuccess(res, data, "Portal session created", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 400);
    sendError(res, "Something went wrong", 500);
  }
};

export const getSubscription = async (req: Request, res: Response) => {
  try {
    const data = await getSubscriptionService(req.user!.id);
    sendSuccess(res, data, "Subscription fetched", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 400);
    sendError(res, "Something went wrong", 500);
  }
};

// Stripe calls this automatically on payment events
// raw body required — must NOT use express.json() on this route
export const stripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return sendError(res, "Missing stripe-signature header", 400);
  }

  try {
    const data = await handleWebhookService(req.body, signature);
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 400);
    sendError(res, "Webhook error", 500);
  }
};