import {body} from "express-validator";

export const registerValidator = [
    body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({min:3, max:15}).withMessage("Username must be between 3 and 15 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers and underscors"),
    body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
    body("password")
    .trim()
    .notEmpty().withMessage("Password is required")
    .isStrongPassword({
        minLength: 7,
        minLowercase: 1,
        minUppercase:1,
        minNumbers: 1,
        minSymbols:1
    }).withMessage("Password must be at least 8 characters and include atleast one uppercase, lowercase, number and symbol")
];

export const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];