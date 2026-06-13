import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import {
  getAnalyticsSummaryService,
  getBudgetUtilisationService,
  getSixMonthTrendService
} from "../services/analyticsService";

const currentMonth = () => new Date().toISOString().slice(0, 7);

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) || currentMonth();
    const data  = await getAnalyticsSummaryService(req.user!.id, month);
    sendSuccess(res, data, "Analytics summary fetched successfully", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 400);
    sendError(res, "Something went wrong", 500);
  }
};

export const getSixMonthTrend = async (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) || currentMonth();
    const data  = await getSixMonthTrendService(req.user!.id, month);
    sendSuccess(res, data, "Trend data fetched successfully", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 400);
    sendError(res, "Something went wrong", 500);
  }
};

export const getBudgetUtilisation = async (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) || currentMonth();
    const data  = await getBudgetUtilisationService(req.user!.id, month);
    sendSuccess(res, data, "Budget utilisation fetched successfully", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 400);
    sendError(res, "Something went wrong", 500);
  }
};
