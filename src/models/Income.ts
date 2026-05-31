import {Document, Types, Schema, model} from "mongoose";

export const INCOME_TYPES = [
    "Salary",
    "Freelance",
    "Rental",
    "Investement",
    "Business",
    "Other"
] as const;

export type IIncomeType = (typeof INCOME_TYPES)[number];

export interface IIncome extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    source: string;
    amount: number;
    date: Date;
    incomeType: IIncomeType;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const incomeSchema = new Schema<IIncome>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        source:{
            type:String,
            required: true,
            trim: true,
            maxLength: 200
        },
        amount: {
            type: Number,
            required: true,
            min:1
        },
        date:{
            type: Date,
            default: Date.now,
            index: true
        },
        incomeType: {
            type: String,
            enum: INCOME_TYPES,
            default: INCOME_TYPES[0],
        },
        notes: {
            type: String,
            trim: true,
            maxLength: 500
        }
    },
    { timestamps: true}
);

incomeSchema.index({userId: -1, date: -1});
incomeSchema.index({userId: -1, incomeType: 1});

const Income = model<IIncome>("Income", incomeSchema);
export default Income;