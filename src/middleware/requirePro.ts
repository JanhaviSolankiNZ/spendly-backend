import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import User from "../models/User";

// ── requirePro middleware ──────────────────────────────────────────────────────
// add to any route that should only be accessible by pro users
// e.g. router.get("/export", protect, requirePro, exportExpensesCSV)
export const requirePro = async (
  req:  Request,
  res:  Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user!.id).select(
      "plan subscriptionStatus"
    );

    if (!user) return sendError(res, "User not found", 401);

    const isActive =
      user.plan === "pro" &&
      (user.subscriptionStatus === "active" ||
       user.subscriptionStatus === "trialing");

    if (!isActive) {
      return sendError(
        res,
        "This feature requires a Pro subscription",
        403
      );
    }

    next();
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 500);
    sendError(res, "Something went wrong", 500);
  }
};