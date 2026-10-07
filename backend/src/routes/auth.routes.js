import { Router } from "express";
import { getMe, googleCallback, login, logout, register, verifyEmail } from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import passport, { isGoogleAuthConfigured } from "../config/passport.js";

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

/**
 * @route GET /api/auth/google
 * @desc Start Google OAuth login
 * @access Public
 */
authRouter.get("/google", (req, res, next) => {
    if (!isGoogleAuthConfigured) {
        return res.status(503).json({
            message: "Google sign-in is not configured on this server",
            success: false
        });
    }

    return passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false
    })(req, res, next);
});

/**
 * @route GET /api/auth/google/callback
 * @desc Google OAuth callback — issues the session cookie and redirects to the app
 * @access Public
 */
authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    }),
    googleCallback
);

export default authRouter;