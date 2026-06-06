import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { type CookieOptions } from "express";

export const createAccessToken = (userId: Types.ObjectId) => {
  return jwt.sign(
    { id: userId, type: "access" },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"],
    }
  );
};


export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!)
};

export const createRefreshToken = (userId: Types.ObjectId) => {
    return jwt.sign(
    { id: userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
    }
  );
};

export const verifyRefreshToken = (token:string) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};

export const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
};