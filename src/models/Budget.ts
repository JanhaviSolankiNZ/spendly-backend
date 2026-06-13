import { Schema, model, Document, Types } from "mongoose";
import { ExpenseCategory, EXPENSE_CATEGORIES } from "../utils/constants";

export interface IBudget extends Document {
  _id:      Types.ObjectId;
  userId:   Types.ObjectId;
  category: ExpenseCategory;
  limit:    number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    category: {
      type:     String,
      enum:     EXPENSE_CATEGORIES,
      required: true,
    },
    limit: {
      type:     Number,
      required: true,
      min:      1,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

const Budget = model<IBudget>("Budget", budgetSchema);
export default Budget;