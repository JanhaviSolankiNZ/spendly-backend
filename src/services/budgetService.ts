import { ExpenseCategory } from "../utils/constants";
import {
  findBudgets,
  upsertBudget,
  deleteBudgetById,
  deleteBudgetByCategory,
} from "../repositories/budgetRepository";

// ── Get all budgets ────────────────────────────────────────────────────────────
export const getBudgetsService = async (userId: string) => {
  return findBudgets(userId);
};

// ── Upsert (create or update) budget ──────────────────────────────────────────
export const upsertBudgetService = async (
  userId:   string,
  category: ExpenseCategory,
  limit:    number
) => {
  return upsertBudget(userId, category, limit);
};

// ── Delete by ID ───────────────────────────────────────────────────────────────
export const deleteBudgetByIdService = async (
  userId:   string,
  budgetId: string
) => {
  const deleted = await deleteBudgetById(userId, budgetId);
  if (!deleted) throw new Error("Budget not found");
};

// ── Delete by category ─────────────────────────────────────────────────────────
export const deleteBudgetByCategoryService = async (
  userId:   string,
  category: ExpenseCategory
) => {
  const deleted = await deleteBudgetByCategory(userId, category);
  if (!deleted) throw new Error("Budget not found");
};