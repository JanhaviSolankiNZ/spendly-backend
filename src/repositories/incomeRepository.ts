import Income, { IIncome } from "../models/Income";
import { Types } from "mongoose";

export const createIncome = (userId: string, data: Partial<IIncome>) => Income.create({...data, userId: new Types.ObjectId(userId)});

export const findIncomes = async (userId: string, month?: string, page: number =1, limit: number = 20 ) => {
    const match: Record<string, any> = {
        userId: new Types.ObjectId(userId)
    };

    if(month){
        const start = new Date(`${month}-01`);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
        match.date = {$gte: start, $lte: end};
    }

    const skip = (page - 1)*limit;

    const [incomes, total] = await Promise.all([
        Income.find(match).sort({date: -1}).skip(skip).limit(limit).lean(),
        Income.countDocuments(match)
    ]);

    return {
        incomes,
        pagination : {
            total,
            page,
            limit,
            totalPages : Math.ceil(total/limit),
            hasNextPage : page < Math.ceil(total/limit)
        }
    }
}

export const getIncomeSummary = async (userId: string, month: string) => {

    const start = new Date(`${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
    const uid = new Types.ObjectId(userId);
    const [summary, byType] = await Promise.all([
        Income.aggregate([
            {$match: {userId: uid, date: {$gte: start, $lte: end}}},
            {
                $group:{
                    _id: null,
                    total: {$sum: "$amount"},
                    count: {$sum: 1}
                }
            }
        ]),
        Income.aggregate([
            {$match: {userId: uid, date: {$gte: start, $lte: end}}},
            {
                $group: {
                    _id: "$incomeType",
                    total : {$sum: "$amount"}
                }
            },
            {
                $sort: {total: -1}
            }
        ])
    ])

    return {
        total: summary[0]?.total ?? 0,
        count: summary[0]?.count ?? 0,
        byType: byType.map((t) => ({type: t._id, total: t.total}))
    }
}

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