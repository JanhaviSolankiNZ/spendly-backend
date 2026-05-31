export const EXPENSE_CATEGORIES = [
    "Essential / Fixed",
    "Lifestyle / Variable",
    "Financial",
    "Work & Education",
    "Social & Family",
    "Miscellaneous"
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const normalise = (str: string) =>
  str.toLowerCase().replace(/[\s\/&]+/g, "");

export type sortBy = "date" | "amount" | "category" | "createdAt";

export const validateMonth = (month: string) => {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("month must be in YYYY-MM format e.g. 2025-04");
  }
};