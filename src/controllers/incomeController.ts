import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { sendError, sendSuccess } from "../utils/response";
import { createIncomeService, deleteIncomeService, getIncomeService, getIncomeSummaryService } from "../services/incomeService";
import { updateExpenseService } from "../services/expenseService";

export const addIncome = async (req: Request, res: Response) => {
    try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        sendError(res, "Validation failed", 400, errors.array());
    }
    const income = await createIncomeService(req.user!.id, req.body);
    sendSuccess(res, {income}, "Income created successfully", 201);

    }catch(error){
        if(error instanceof Error){
            sendError(res, error.message, 500)
        }
        sendError(res, "Something went wrong", 500);
    }
}

export const getIncomes = async (req: Request, res: Response) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
        sendError(res, "Validation failed", 400, errors.array());
        }
        const month = req.query.month as string | undefined;
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;

        const result = await getIncomeService(req.user!.id, month, page, limit);

        sendSuccess(res, result, "Income history fetched successfully", 200);
    }catch(error){
        if(error instanceof Error) return sendError(res, error.message, 500);
        sendError(res, "Something went wrong", 500);
    }
}

export const getIncomeSummary = async (req: Request, res: Response) => {
    try{
        const month = req.query.month as string || new Date().toISOString().slice(0,7);
        const data = await getIncomeSummaryService(req.user!.id, month);
        sendSuccess(res, data, "Income summary fetched successfully", 200);
    }catch(error){
        if(error instanceof Error) return sendError(res, error.message, 500);
        sendError(res, "Something went wrong", 500);
    }
}

export const updateIncome = async (req: Request, res: Response) => {
    try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        sendError(res, "Validation failed", 400, errors.array());
    }
    const income = await updateExpenseService(req.user!.id, req.params.incomeId as string, req.body);
    sendSuccess(res, {income}, "Income updated successfully", 200);

    }catch(error){
        if(error instanceof Error){
            sendError(res, error.message, 500)
        }
        sendError(res, "Something went wrong", 500);
    }

}


export const deleteIncome =  async (req: Request, res: Response) => {
    try{

    await deleteIncomeService(req.user!.id, req.params.incomeId as string);
    sendSuccess(res, null, "Income deleted successfully", 200);

    }catch(error){
        if(error instanceof Error){
            sendError(res, error.message, 500)
        }
        sendError(res, "Something went wrong", 500);
    }

}