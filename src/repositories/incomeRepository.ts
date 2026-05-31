import Income, { IIncome } from "../models/Income";
import { Types } from "mongoose";

export const createIncome = (userId: string, data: Partial<IIncome>) => Income.create({...data, userId: new Types.ObjectId(userId)});

export const findIncomeById = (userId: string, incomeId: string) => Income.findOne({_id: new Types.ObjectId(incomeId), userId: new Types.ObjectId(userId)});

export const updateIncomeById = (userId: string, incomeId: string, updates: Partial<IIncome>) => Income.findOneAndUpdate(
    {
    _id: new Types.ObjectId(incomeId),
    userId: new Types.ObjectId(userId),
},
{$set: updates},
{new: true, runValidators: true}
)

export const deleteIncomeById = (userId: string, incomeId: string) => Income.deleteOne({_id: new Types.ObjectId(incomeId), userId: new Types.ObjectId(userId)})