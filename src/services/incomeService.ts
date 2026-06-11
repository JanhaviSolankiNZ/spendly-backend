import { IIncome } from "../models/Income";
import { createIncome, deleteIncomeById, findIncomeById, findIncomes, getIncomeSummary, updateIncomeById } from "../repositories/incomeRepository";

const validateMonth = (month: string) => {
    if(!/^\d{4}-\d{2}$/.test(month)){
        throw new Error("month must be in YYYY-MM format e.g. 2025-04")
    }
}

export const createIncomeService = async(userId: string, data: Partial<IIncome>) => {
    const income = await createIncome(userId, data);
    return income;
}

export const getIncomeService = async (userId: string, month?: string, page?: number, limit?: number) => {
    if(month) validateMonth(month);
    return findIncomes(userId, month, page, limit);
}

export const getIncomeSummaryService = async (userId: string, month: string) => {
    if(month) validateMonth(month);
    return getIncomeSummary(userId, month);
}

export const getIncomeByIdService = async (userId: string, incomeId: string) => {
    const income = await findIncomeById(userId, incomeId);
    if(!income) throw new Error("Income not found");
    return income;
}

export const updateIncomeService = async(userId: string,incomeId: string, data: Partial<IIncome>) => {
    const updatedIncome = await updateIncomeById(userId,incomeId, data);
    if(!updatedIncome) throw new Error("Income not found");
    return updatedIncome;
}

export const deleteIncomeService = async(userId: string,incomeId: string) => {
    const deleted = await deleteIncomeById(userId, incomeId);
      if(!deleted) throw new Error("Income not found!");
}