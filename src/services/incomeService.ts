import { IIncome } from "../models/Income";
import { createIncome, deleteIncomeById, updateIncomeById } from "../repositories/incomeRepository";

export const createIncomeService = async(userId: string, data: Partial<IIncome>) => {
    const income = await createIncome(userId, data);
    return income;
}

export const updateIncomeService = async(userId: string,incomeId: string, data: Partial<IIncome>) => {
    const updatedIncome = await updateIncomeById(userId,incomeId, data);
    return updatedIncome;
}

export const deleteIncomeService = async(userId: string,incomeId: string) => {
    const deleted = await deleteIncomeById(userId, incomeId);
      if(!deleted) throw new Error("Income not found!");
}