import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { verifyAccessToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { findUserById } from "../repositories/authRepository";

declare global{
    namespace Express{
        interface User {          // ← Passport reads from this interface
      id:       string;
      email:    string;
      username: string;
      isPro?: boolean;
    }
    interface Request {
      user?: User;            // ← now uses the interface above
    }
    }
}


export const protect= async (req: Request, res: Response, next: NextFunction ) => {
    try{
        const token = req.cookies.accessToken;
        if(!token){
            return sendError(res, "Access token required", 401);
        }

        const decoded = verifyAccessToken(token) as  JwtPayload;

        if(!decoded){
            return sendError(res, "Invalid or expired access token", 401);
        }

        const user = await findUserById(decoded.id);

        if(!user){
            return sendError(res, "User no longer exists", 401);
        }

        req.user ={
            id: decoded.id
        } as Express.User;
        next();

    }catch(error){
        return sendError(res, "Authentication failed", 401);
    }
}