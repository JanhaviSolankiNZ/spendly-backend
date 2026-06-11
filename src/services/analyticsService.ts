import { getAnalyticsSummary, getSixMonthTrend } from "../repositories/analyticsRepository";

const validateMonth = (month: string) => {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("month must be in YYYY-MM format e.g. 2025-04");
  }
};


export const getAnalyticsSummaryService = async (
  userId: string,
  month:  string
) => {
  validateMonth(month);
  return getAnalyticsSummary(userId, month);
};

export const getSixMonthTrendService = async (
  userId:       string,
  currentMonth: string
) => {
  validateMonth(currentMonth);
  return getSixMonthTrend(userId, currentMonth);
};
