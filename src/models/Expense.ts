import { Schema, model, Document, Types } from "mongoose";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "../utils/constants";

export interface IExpense extends Document{
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        amount: {
            type: Number,
            required: true,
            min: 1
        },
        category:{
            type: String,
            enum: EXPENSE_CATEGORIES,
            default: "Miscellaneous"
        },
        date:{
            type: Date,
            default: Date.now,
            index: true
        },
        notes:{
            type: String,
            trim: true,
            maxLength: 500
        }
    },
    { timestamps: true }
)

expenseSchema.index({userId:1, date: -1});
expenseSchema.index({userId:1, category:1});
const Expense = model<IExpense>("Expense", expenseSchema);
export default Expense;