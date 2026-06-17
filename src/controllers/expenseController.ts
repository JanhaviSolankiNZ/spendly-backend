import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  categoriseWithAI,
  createExpenseService,
  deleteExpenseService,
  getExpensesService,
  updateExpenseService,
  getExpenseSummaryService,
  getExpenseService,
  getExpensesForExportService
} from "../services/expenseService";
import { sendError, sendSuccess } from "../utils/response";
import { IExpenseFilters } from "../repositories/expenseRepository";
import { Parser } from "json2csv";

export const getCategoryWithAI = async (req: Request, res: Response) => {
  try {
    const category = await categoriseWithAI(req.body.description);
    sendSuccess(res, { category }, "Categorised successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(res, error.message, 500);
    }
    sendError(res, "Something went wrong", 500);
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation failed", 400, errors.array());
    }
    const expense = await createExpenseService(req.user!.id, req.body);

    sendSuccess(res, { expense }, "Expense created successfully", 201);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(res, error.message, 500);
    }
    sendError(res, "Something went wrong", 500);
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params as { expenseId: string };
    await deleteExpenseService(req.user!.id, expenseId);
    sendSuccess(res, null, "Expense deleted successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(
        res,
        error.message,
        error.message === "Expense not found" ? 404 : 500,
      );
    }
    sendError(res, "Something went wrong", 500);
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation failed", 400, errors.array());
    }
    const { expenseId } = req.params as { expenseId: string };
    const updatedExpense = await updateExpenseService(
      req.user!.id,
      expenseId,
      req.body,
    );

    sendSuccess(res, { updatedExpense }, "Expense updated successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(
        res,
        error.message,
        error.message === "Expense not found" ? 404 : 500,
      );
    }
    sendError(res, "Something went wrong", 500);
  }
};

export const listExpenses = async (req: Request, res: Response) => {
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation failed", 400, errors.array());
    }
    const filters = {
      category: req.query.category as string | undefined,
      month: req.query.month as string | undefined,
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder:  req.query.sortOrder as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    }

    const result = await getExpensesService(req.user!.id, filters as Partial<IExpenseFilters>);
    sendSuccess(res, result, "Expenses fetched successfully", 200);
  }catch(error){
     if (error instanceof Error) {
      return sendError(res, error.message, 500);
    }
    sendError(res, "Something went wrong", 500);
  }
};

export const getExpense = async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params as { expenseId: string };
   const expense =  await getExpenseService(req.user!.id, expenseId);
    sendSuccess(res, {expense}, "Expense fetched successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(
        res,
        error.message,
        error.message === "Expense not found" ? 404 : 500,
      );
    }
    sendError(res, "Something went wrong", 500);
  }
};

export const createExpenseSummary = async (req: Request, res: Response) => {
  try{

      const month = (req.query.month as string) || new Date().toISOString().slice(0,7);
      const data = await getExpenseSummaryService(req.user!.id, month);
      sendSuccess(res, data, "Summary fetched successfully", 200);
  }catch(error){
    if (error instanceof Error) {
      return sendError(res, error.message, 400);
    }
    sendError(res, "Something went wrong", 500);
  }
}

export const exportExpenseCsv = async (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const data = await getExpensesForExportService(req.user!.id, month);
    if(data.length === 0){
      return sendError(res, "No expenses found for this month", 404);
    }

    const parser = new Parser({
      fields: ["Description", "Amount", "Category", "Date", "Notes"]
    });

    const csv = parser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=Expenses_${month}.csv`);
    res.status(200).send(csv);

  }catch(error){
    if (error instanceof Error) {
      return sendError(res, error.message, 400);
    }
    sendError(res, "Something went wrong", 500);
  }
}