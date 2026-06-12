import { getDashboardData } from "../repositories/dashboardRepository";

const validateMonth = (month: string) => {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("month must be in YYYY-MM format e.g. 2025-04");
  }
};

export const getDashboardService = async (userId: string, month: string) => {
  validateMonth(month);
  return getDashboardData(userId, month);
};
