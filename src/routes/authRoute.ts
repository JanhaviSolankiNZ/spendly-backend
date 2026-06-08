import express from "express";
const router = express.Router();
const rateLimiter = require("express-rate-limit");
import { register, login, logout, refreshAccessToken } from "../controllers/authController";

const authLimier = rateLimiter({
    windowMs: 15*60*1000,
    max: 100, // each IP to 100 request per windowMs
    message: {success: false, message: "Too many requests! Please try again later."},
    standardHeaders: true, //Return rate limit info in `RateLimit-*` header
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

router.post("/register", authLimier, register);
router.post("/login", authLimier, login);
router.post("/logout", logout);
router.post("/refreshAccessToken", refreshAccessToken);

export default router;