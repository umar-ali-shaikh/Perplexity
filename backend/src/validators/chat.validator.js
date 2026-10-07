import { body } from "express-validator";
import { validate } from "./auth.validator.js";

export const sendMessageValidator = [
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ max: 4000 })
        .withMessage("Message must be at most 4000 characters"),

    body("chatId")
        .optional()
        .isMongoId()
        .withMessage("Invalid chat id"),

    validate
];
