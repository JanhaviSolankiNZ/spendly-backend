import { groqAxiosInstance } from "../config/axios";
import { EXPENSE_CATEGORIES, normalise, validateMonth } from "../utils/constants";
import { IExpense } from "../models/Expense";
import { createExpense, deleteExpenseById, findExpenseById, findExpenses, getExpenseSummary, IExpenseFilters, updateExpenseById } from "../repositories/expenseRepository";

export const categoriseWithAI = async (
  description: string,
): Promise<string> => {
  try {
    const response = await groqAxiosInstance.post(
      "/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an expense categoriser. Reply with ONLY the category name, nothing else. No punctuation, no explanation.",
          },
          {
            role: "user",
            content: `Classify this expense into exactly one of these categories:
${EXPENSE_CATEGORIES.join(", ")} Expense: ${description}`,
          },
        ],
        max_tokens: 20,
        temperature: 0,
      },
    );

    const raw = response.data.choices[0]?.message?.content?.trim() ?? "";

    const matched = EXPENSE_CATEGORIES.find(
      (c) => normalise(c) === normalise(raw),
    );

    return matched ?? "Miscellaneous";
  } catch (error) {
    return "Miscellaneous";
  }
};

export const createExpenseService = async(userId:string, body: Partial<IExpense>) => {
  const expense = await createExpense(userId, body);
  return expense;
};

export const deleteExpenseService = async (userId: string, expenseId: string) => {
  const deleted = await deleteExpenseById(userId, expenseId);
  if(!deleted) throw new Error("Expense not found!");
};

export const updateExpenseService = async (userId: string, expenseId: string, body: Partial<IExpense>) => {
  const updatedExpense = await updateExpenseById(userId, expenseId, body);
  return updatedExpense;
};
export const getExpensesService = async (userId: string, filters: IExpenseFilters) => {
  return findExpenses(userId, filters);
};

export const getExpenseSummaryService = async (userId:string, month: string) => {
  validateMonth(month);
  return getExpenseSummary(userId, month);
};

export const getExpenseService = async (userId: string, expenseId: string) => {
  return findExpenseById(userId, expenseId);
};