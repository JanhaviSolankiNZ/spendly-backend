import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { sendSuccess, sendError } from "../utils/response";
import {
  getBudgetsService,
  upsertBudgetService,
  deleteBudgetByIdService,
  deleteBudgetByCategoryService,
} from "../services/budgetService";
import { ExpenseCategory } from "../utils/constants";

// ── GET /api/budgets ───────────────────────────────────────────────────────────
// returns all budgets for the logged in user
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const budgets = await getBudgetsService(req.user!.id);
    sendSuccess(res, { budgets }, "Budgets fetched successfully", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 500);
    sendError(res, "Something went wrong", 500);
  }
};

// ── POST /api/budgets ──────────────────────────────────────────────────────────
// creates or updates a budget for a category (upsert)
// if budget for that category already exists → updates the limit
// if not → creates a new one
export const upsertBudget = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation failed", 400, errors.array());
    }

    const { category, limit } = req.body as {
      category: ExpenseCategory;
      limit:    number;
    };

    const budget = await upsertBudgetService(req.user!.id, category, limit);
    sendSuccess(res, { budget }, "Budget saved successfully", 200);
  } catch (error) {
    if (error instanceof Error) return sendError(res, error.message, 500);
    sendError(res, "Something went wrong", 500);
  }
};

// ── DELETE /api/budgets/:id ────────────────────────────────────────────────────
// delete by MongoDB _id
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await deleteBudgetByIdService(req.user!.id, id);
    sendSuccess(res, null, "Budget deleted successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(
        res,
        error.message,
        error.message === "Budget not found" ? 404 : 500
      );
    }
    sendError(res, "Something went wrong", 500);
  }
};

// ── DELETE /api/budgets/category/:category ─────────────────────────────────────
// delete by category name — useful from the frontend budget page
export const deleteBudgetByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    await deleteBudgetByCategoryService(req.user!.id, category as ExpenseCategory);
    sendSuccess(res, null, "Budget deleted successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(
        res,
        error.message,
        error.message === "Budget not found" ? 404 : 500
      );
    }
    sendError(res, "Something went wrong", 500);
  }
};