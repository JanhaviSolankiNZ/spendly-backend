import { Types } from "mongoose";
import Expense, { IExpense } from "../models/Expense";
import { ExpenseCategory, sortBy } from "../utils/constants";

export interface IExpenseFilters {
  category?: ExpenseCategory;
  month?: string;
  search?: string;
  sortBy?: sortBy;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const createExpense = (userId: string, data: Partial<IExpense>) =>
  Expense.create({ ...data, userId: new Types.ObjectId(userId) });

export const findExpenseById = (userId: string, expenseId: string) =>
  Expense.findOne({
    userId: new Types.ObjectId(userId),
    _id: new Types.ObjectId(expenseId),
  });

export const updateExpenseById = (
  userId: string,
  expenseId: string,
  data: Partial<IExpense>,
) =>
  Expense.findOneAndUpdate(
    { _id: new Types.ObjectId(expenseId), userId: new Types.ObjectId(userId) },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    },
  );

export const deleteExpenseById = (userId: string, expenseId: string) =>
  Expense.deleteOne({
    _id: new Types.ObjectId(expenseId),
    userId: new Types.ObjectId(userId),
  });

export const buildMatchFilter = (
  userId: string,
  filters: IExpenseFilters,
): Record<string, any> => {
  const match: Record<string, any> = {
    userId: new Types.ObjectId(userId),
  };

  if (filters.category) {
    match.category = filters.category;
  }

  if (filters.month) {
    const start = new Date(`${filters.month}-01`);
    const end = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    match.date = { $gte: start, $lte: end };
  }

  if (filters.search) {
    match.description = { $regex: filters.search, $options: "i" }; //case insensitive
  }

  return match;
};

export const findExpenses = async (
  userId: string,
  filters: IExpenseFilters,
) => {
  const match = buildMatchFilter(userId, filters);
  const { sortBy = "date", sortOrder = "desc", page = 1, limit = 10 } = filters;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 } as Record<
    string,
    1 | -1
  >;
  const skip = (page - 1) * limit;
  const [expenses, total] = await Promise.all([
    Expense.find(match).sort(sort).skip(skip).limit(limit).lean(),
    Expense.countDocuments(match),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    expenses,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
};

export const getExpenseSummary = async (userId: string, month: string) => {
  const start = new Date(`${month}-01`);
  const end = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
  const prevEnd = new Date(
    start.getFullYear(),
    start.getMonth(),
    0,
    23,
    59,
    59,
  );

  const uid = new Types.ObjectId(userId);

  const [current, previous, largest] = await Promise.all([
    Expense.aggregate([
      {
        $match: { userId: uid, date: { $gte: start, $lte: end } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    Expense.aggregate([
      {
        $match: { userId: uid, date: { $gte: prevStart, $lte: prevEnd } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),

    Expense.findOne(
      { userId: uid, date: { $gte: start, $lte: end } },
      { description: 1, amount: 1 },
    )
      .sort({ amount: -1 })
      .lean(),
  ]);

  const totalExpenses = current[0]?.total ?? 0;
  const transactions = current[0]?.count ?? 0;
  const prevTotal = previous[0]?.total ?? 0;
  const daysInMonth = end.getDate();
  const dailyAverage =
    transactions > 0 ? parseFloat((totalExpenses / daysInMonth).toFixed(2)) : 0;
  const vsLastMonth =
    prevTotal > 0
      ? parseFloat((((totalExpenses - prevTotal) / prevTotal) * 100).toFixed(2))
      : 0;

  return {
    totalExpenses,
    transactions,
    largestSpend: largest
      ? { description: largest.description, amount: largest.amount }
      : null,
    dailyAverage,
    daysInMonth,
    vsLastMonth,
  };
};

export const getExpensesForExport = async (userId: string, month: string) => {
  const start = new Date(`${month}-01`);
  const end = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  return Expense.find(
    {
      userId: new Types.ObjectId(userId),
      date: { $gte: start, $lte: end },
    },
    { _id: 0, userId: 0, _v: 0 },
  )
    .sort({ date: -1 })
    .lean();
};


export const countExpensesThisMonth = async (userId: string): Promise<number> => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return Expense.countDocuments({
    userId: new Types.ObjectId(userId),
    date:   { $gte: start },
  });
};