import { Types } from "mongoose";
import Budget, { IBudget } from "../models/Budget";
import { ExpenseCategory } from "../utils/constants";

// ── Get all budgets for a user ─────────────────────────────────────────────────
export const findBudgets = async (userId: string): Promise<IBudget[]> => {
  return Budget.find({ userId: new Types.ObjectId(userId) }).lean() as any;
};

// ── Get single budget by category ─────────────────────────────────────────────
export const findBudgetByCategory = async (
  userId:   string,
  category: ExpenseCategory
): Promise<IBudget | null> => {
  return Budget.findOne({
    userId:   new Types.ObjectId(userId),
    category,
  });
};

// ── Upsert — create if not exists, update limit if exists ─────────────────────
export const upsertBudget = async (
  userId:   string,
  category: ExpenseCategory,
  limit:    number
): Promise<IBudget> => {
  return Budget.findOneAndUpdate(
    {
      userId:   new Types.ObjectId(userId),
      category,
    },
    { $set: { limit } },
    {
      new:    true,         // return updated document
      upsert: true,         // create if not found
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ) as any;
};

// ── Delete budget by ID ────────────────────────────────────────────────────────
export const deleteBudgetById = async (
  userId:   string,
  budgetId: string
): Promise<boolean> => {
  if (!Types.ObjectId.isValid(budgetId)) return false;

  const result = await Budget.deleteOne({
    _id:    new Types.ObjectId(budgetId),
    userId: new Types.ObjectId(userId),
  });

  return result.deletedCount === 1;
};

// ── Delete budget by category ──────────────────────────────────────────────────
export const deleteBudgetByCategory = async (
  userId:   string,
  category: ExpenseCategory
): Promise<boolean> => {
  const result = await Budget.deleteOne({
    userId:   new Types.ObjectId(userId),
    category,
  });

  return result.deletedCount === 1;
};