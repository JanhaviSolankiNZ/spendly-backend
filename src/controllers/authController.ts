import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";
import { validationResult } from "express-validator";
import { sendSuccess, sendError } from "../utils/response";
import {
  createAccessToken,
  createRefreshToken,
  refreshCookieOptions,
  verifyRefreshToken,
} from "../utils/jwt";
import { Types } from "mongoose";
import {
  findUserById,
  findUserByIdAndUpdate,
  saveRefreshToken,
} from "../repositories/authRepository";
import { JwtPayload } from "jsonwebtoken";

const generateTokens = (userId: Types.ObjectId) => {
  const refreshToken = createRefreshToken(userId);
  const accessToken = createAccessToken(userId);

  return { refreshToken, accessToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation failed", 400, errors.array());
    }
    const { email, username, password } = req.body;

    const newUser = await registerUser(email, password, username);
    const { refreshToken, accessToken } = generateTokens(newUser._id);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    sendSuccess(
      res,
      {
        accessToken,
      },
      "User registered successfully",
      201,
    );
  } catch (error) {
    if ((error as any).code === 11000) {
      const field = Object.keys((error as any).keyPattern)[0]; // "email" or "username"
      return sendError(res, `${field} already exists`, 409);
    }

    if (error instanceof Error) {
      return sendError(res, error.message, 500);
    }

    sendError(res, "Something went wrong!", 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation failed", 400, errors.array());
    }

    const { email, password } = req.body;

    const user = await loginUser(email, password);
    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }
    const { refreshToken, accessToken } = generateTokens(user._id);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.expiresAt && t.expiresAt > new Date() && !t.isRevoked,
    );

    saveRefreshToken(user, refreshToken);
    await user.save();
    sendSuccess(
      res,
      {
        accessToken,
        user: user.toPublicProfile(),
      },
      "Authentication successful",
      200,
    );
  } catch (error) {
    if (error instanceof Error) {
      return sendError(res, error.message, 500);
    }
    sendError(res, "Something went wrong", 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return sendError(res, "No refresh token provided", 401);
    }
    const decodedUser = verifyRefreshToken(token) as JwtPayload;
    if (decodedUser) {
      await findUserByIdAndUpdate(decodedUser.id, {
        $pull: { refreshTokens: { token } },
      });
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    sendSuccess(res, null, "Logged out successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendError(res, error.message, 500);
    }
    sendError(res, "Something went wrong", 500);
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  console.log("cookies:", req.cookies);
  console.log("cookie header:", req.headers.cookie);
  if (!token) {
   return sendError(res, "No refresh token provided", 401);
  }

  const decoded = verifyRefreshToken(token) as JwtPayload;

  if (!decoded) {
   return sendError(res, "Invalid refresh token", 401);
  }

  const user = await findUserById(decoded.id);
  if (user === null) {
    return sendError(res, "User not found", 401);
  }
  const storedToken = user.refreshTokens.find((t) => t.token === token);
  if (!storedToken) {
    user.refreshTokens = [];
    await user.save();
    return sendError(res, "Refresh token not recognized", 401);
  }

  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
  const { refreshToken, accessToken } = generateTokens(user._id);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.expiresAt && t.expiresAt > new Date() && !t.isRevoked,
  );

  saveRefreshToken(user, refreshToken);
  await user.save();
  sendSuccess(
    res,
    {
      accessToken,
      user: user.toPublicProfile(),
    },
    "New access token is generated successfully",
    200,
  );
};

export const googleCallback = async (req: Request, res: Response) => {
  try{
    const user = await findUserById(req.user?.id!);
    if (!user) return sendError(res, "Google authentication failed", 401);

    const accessToken  = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    saveRefreshToken(user, refreshToken);
    await user.save();

    res.redirect(
      `${process.env.CLIENT_URL}/auth/google/success?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(user.toPublicProfile()))}`
    );

  }catch{
    res.redirect(`${process.env.CLIENT_URL}/signin?error=google_failed`);
  }
}
