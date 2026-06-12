import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { getDashboardService } from "../services/dashboardService";

// ── GET /api/dashboard?month=2025-04 ──────────────────────────────────────────
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const data  = await getDashboardService(req.user!.id, month);
    sendSuccess(res, data, "Dashboard data fetched successfully", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 400);
    sendError(res, "Something went wrong", 500);
  }
};