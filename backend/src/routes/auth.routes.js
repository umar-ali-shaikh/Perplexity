import { Router } from "express";
import { getMe, login, logout, register, verifyEmail } from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body {username, email, password}
 */
authRouter.post("/register", registerValidator, register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 * @body {email, password}
 */
authRouter.post("/login", loginValidator, login);

/**
 * @route GET /api/auth/get-me
 * @desc Get currently authenticated user's profile
 * @access Private
 */
authRouter.get("/get-me", authMiddleware, getMe)

/**
 * @route POST /api/auth/logout
 * @desc Clear the auth cookie and end the session
 * @access Private
 */
authRouter.post("/logout", authMiddleware, logout);

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query {token}
 */
authRouter.get("/verify-email", verifyEmail);

export default authRouter;