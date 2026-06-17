import { Types } from "mongoose";
import Expense from "../models/Expense";
import Income  from "../models/Income";
import Budget  from "../models/Budget";

export const getDashboardData = async (userId: string, month: string) => {
  const start = new Date(`${month}-01`);
  const end   = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

  // previous month — for % change comparisons
  const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
  const prevEnd   = new Date(start.getFullYear(), start.getMonth(), 0, 23, 59, 59);

  const uid = new Types.ObjectId(userId);

  const [
    expenseSummary,
    prevExpenseSummary,
    incomeSummary,
    prevIncomeSummary,
    recentExpenses,
    recentIncome,
    budgetUtilisation,
    dailyExpenses,
  ] = await Promise.all([

    // ── current month expense total + count ───────────────────────────────────
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),

    // ── previous month expenses — for % change ────────────────────────────────
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // ── current month income total ─────────────────────────────────────────────
    Income.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // ── previous month income — for % change ──────────────────────────────────
    Income.aggregate([
      { $match: { userId: uid, date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // ── 5 most recent expenses — recent transactions list ─────────────────────
    Expense.find(
      { userId: uid, date: { $gte: start, $lte: end } },
      { userId: 0, __v: 0 }
    )
      .sort({ date: -1 })
      .limit(5)
      .lean(),

    // ── 3 most recent income entries ───────────────────────────────────────────
    Income.find(
      { userId: uid, date: { $gte: start, $lte: end } },
      { userId: 0, __v: 0 }
    )
      .sort({ date: -1 })
      .limit(3)
      .lean(),

    // ── budget utilisation per category ───────────────────────────────────────
    (async () => {
      const budgets = await Budget.find({ userId: uid }).lean();
      if (budgets.length === 0) return [];

      const spent = await Expense.aggregate([
        { $match: { userId: uid, date: { $gte: start, $lte: end } } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
      ]);

      const spentMap: Record<string, number> = {};
      spent.forEach((s) => { spentMap[s._id] = s.total; });

      return budgets.map((b) => {
        const spentAmount = spentMap[b.category] ?? 0;
        const percent     = b.limit > 0
          ? parseFloat(((spentAmount / b.limit) * 100).toFixed(1))
          : 0;
        return {
          category:     b.category,
          limit:        b.limit,
          spent:        spentAmount,
          remaining:    Math.max(b.limit - spentAmount, 0),
          percent,
          isOverBudget: spentAmount > b.limit,
        };
      });
    })(),

    // ── daily expense totals — sparkline / mini line chart ────────────────────
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id:   { $dayOfMonth: "$date" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalExpenses  = expenseSummary[0]?.total    ?? 0;
  const prevExpenses   = prevExpenseSummary[0]?.total ?? 0;
  const totalIncome    = incomeSummary[0]?.total     ?? 0;
  const prevIncome     = prevIncomeSummary[0]?.total  ?? 0;
  const netSavings     = totalIncome - totalExpenses;
  const daysInMonth    = end.getDate();

  // % change vs last month
  const expenseChange = prevExpenses > 0
    ? parseFloat((((totalExpenses - prevExpenses) / prevExpenses) * 100).toFixed(1))
    : null;

  const incomeChange = prevIncome > 0
    ? parseFloat((((totalIncome - prevIncome) / prevIncome) * 100).toFixed(1))
    : null;

  return {
    // ── KPI summary ────────────────────────────────────────────────────────────
    summary: {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsPercent:  totalIncome > 0
        ? parseFloat(((netSavings / totalIncome) * 100).toFixed(1))
        : 0,
      transactions:    expenseSummary[0]?.count ?? 0,
      dailyAverage:    totalExpenses > 0
        ? parseFloat((totalExpenses / daysInMonth).toFixed(2))
        : 0,
      daysInMonth,
      expenseChange,   // e.g. +3.2 means 3.2% more than last month
      incomeChange,    // e.g. +8 means 8% more than last month
    },

    // ── recent transactions ────────────────────────────────────────────────────
    recentExpenses,
    recentIncome,

    // ── budget bars ────────────────────────────────────────────────────────────
    budgets: budgetUtilisation,

    // ── daily spending sparkline ───────────────────────────────────────────────
    dailyExpenses: dailyExpenses.map((d) => ({
      day:   d._id,
      total: d.total,
    })),
  };
};