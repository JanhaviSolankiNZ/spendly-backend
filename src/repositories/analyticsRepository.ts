import { Types } from "mongoose";
import Income from "../models/Income";
import Expense from "../models/Expense";

const monthRange = (month:string) => {
    const start = new Date(`${month}-01`);
  const end   = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export const getAnalyticsSummary = async (userId: string, month: string) => {
    const { start, end } = monthRange(month);

    const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    const prevEnd   = new Date(start.getFullYear(), start.getMonth(), 0, 23, 59, 59);

    const uid = new Types.ObjectId(userId);

    const [
        incomeTotal,
        prevIncomeTotal,
        expenseTotal,
       expenseByCategory
    ] = await Promise.all([
        Income.aggregate([
           { $match: {userId: uid, date: {$gte: start, $lte: end}}},
            {$group: {_id: null, total: {$sum: "$amount"}}}
        ]),

        Income.aggregate([
           { $match: {userId: uid, date: {$gte: prevStart, $lte: prevEnd}}},
            {$group: {_id: null, total: {$sum: "$amount"}}}
        ]),

        Expense.aggregate([
            {$match: {userId: uid, date: {$gte: start, $lte: end}}},
            {$group: {_id:null, total: {$sum: "$amount"}, count: {$sum: 1}}}
        ]),

        Expense.aggregate([
            {$match: {userId: uid, date: {$gte: start, $lte: end}}},
            {$group: {_id: "$category", total: {$sum: "$amount"}, count: {$sum: 1}}},
            {$sort: {total: -1}}
        ])
    ]);

    const totalExpenses = expenseTotal[0]?.total ?? 0;
    const totalIncome = incomeTotal[0]?.total ?? 0;
    const prevIncome = prevIncomeTotal[0]?.total ?? 0;
    const netSavings = totalIncome - totalExpenses;

    const topCategory = expenseByCategory[0]
    ? {
        name: expenseByCategory[0]._id,
        total: expenseByCategory[0].total,
        percent: totalExpenses > 0 ? parseFloat(((expenseByCategory[0].total/totalExpenses)*100).toFixed(1)) : 0
    } : null;


    const vsLastMonth = prevIncome > 0 ?
        parseFloat((((totalIncome - prevIncome) / prevIncome) * 100).toFixed(1))
    : null;

    return {
        totalIncome,
        totalExpenses,
        netSavings,
        topCategory,
        vsLastMonth,
        savingsParcentage: totalIncome > 0
        ? parseFloat(((netSavings/totalIncome)*100).toFixed(1)) : 0,
        expensesPercentage: totalIncome > 0
        ?parseFloat(((totalExpenses/totalIncome)*100).toFixed(1)) : 0,
        byCategory: expenseByCategory.map((c) => ({
            category: c._id,
            total: c.total,
            count: c.count,
            percent: totalExpenses > 0
        ? parseFloat(((c.total / totalExpenses) * 100).toFixed(1))
        : 0,
        }))
    }
}

export const getSixMonthTrends = async (userId: string, currentMonth: string) => {
    const uid = new Types.ObjectId(userId);
    const [year, month] = currentMonth.split("_").map(Number);
    const end = new Date(year, month - 1, 0, 23, 59, 59);
    const start = new Date(year, month - 6, 1);

    const trend = await Expense.aggregate([
      {$match: {userId: uid, date: {$gte: start, $lte: end}}},
      {
        $group: {
            _id: {
                year: {$year: "$date"},
                month: {$month: "$date"}
            },
            total: {$sum: "$amount"},
            count: {$sum: 1}
        }
      } ,
      {$sort: {"_id.year": 1, "_id.month": 1}}
    ]);

    const average = trend.length > 0 ?
    parseFloat((trend.reduce((sum, t) => sum + t.total, 0) / trend.length).toFixed(2)) : 0;

    return{
        trend: trend.map(t => ({
            year: t._id.year,
            month: t._id.month,
            label: `{t._id.year}-${String(t._id.month).padStart(2, "0")}`,
            total: t.total,
            count: t.count,
            current: `{t._id.year}-${String(t._id.month).padStart(2, "0")}` === currentMonth,
        })),
        average
    }
}