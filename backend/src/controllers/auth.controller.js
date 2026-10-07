import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";

const isProduction = process.env.NODE_ENV === "production";

// Frontend and backend are deployed on separate domains in production
// (e.g. Vercel + Render), which makes every API call cross-site — that
// requires SameSite=None (+ Secure, which browsers mandate alongside it).
// Locally both run on localhost, which browsers treat as same-site, so
// Lax (and no Secure, since there's no HTTPS) is what works there.
const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user and send email verification link
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        // Check whether username or email is already registered
        const isUserAlreadyExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "User with this username or email already exists",
                success: false,
                err: "User already exists"
            });
        }

        // Create new user
        // Password will be hashed by the User model pre-save middleware
        const user = await User.create({
            username,
            email,
            password
        });

        // Create JWT verification token valid for 24 hours
        const verificationToken = jwt.sign(
            {
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        // Create email verification URL (must hit the backend API,
        // which verifies the token and then redirects to the frontend login page)
        const verificationUrl =
            `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

        // Send verification email to the user
        await sendEmail({
            to: user.email,
            subject: "Verify your Perplexity account",

            text: `Verify your email by visiting: ${verificationUrl}`,

            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Welcome to Perplexity! 🎉</h2>

                    <p>Your account has been created successfully.</p>

                    <p>Please verify your email address by clicking the button below:</p>

                    <a
                        href="${verificationUrl}"
                        style="
                            display: inline-block;
                            padding: 12px 20px;
                            background: #000;
                            color: #fff;
                            text-decoration: none;
                            border-radius: 6px;
                        "
                    >
                        Verify Email
                    </a>

                    <p>This verification link will expire in 24 hours.</p>

                    <br />

                    <p>
                        Thanks,<br />
                        The Perplexity Team
                    </p>
                </div>
            `
        });

        return res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Something went wrong while registering",
            success: false,
            error: error.message
        });
    }
}

/**
 * @route POST /api/auth/login
 * @desc Login user with email and password
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check whether user exists
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        // Check whether user's email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in",
                success: false
            });
        }

        // Accounts created via Google sign-in have no password set
        if (!user.password) {
            return res.status(400).json({
                message: "This account uses Google sign-in. Please continue with Google instead.",
                success: false
            });
        }

        // Compare entered password with hashed password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set JWT in HTTP-only cookie
        res.cookie("token", token, {
            ...AUTH_COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Login successful
        return res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                messageCount: user.messageCount
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong while logging in",
            success: false,
            error: error.message
        });
    }
}

/**
 * @route GET /api/auth/google/callback
 * @desc Complete Google OAuth login and issue the session cookie
 * @access Public (runs after passport's "google" strategy populates req.user)
 */
export async function googleCallback(req, res) {
    try {
        const user = req.user;

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            ...AUTH_COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        console.error("Google callback error:", error);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
    }
}

/**
 * @route GET /api/auth/get-me
 * @desc Get currently authenticated user's profile
 * @access Private
 */
export async function getMe(req, res) {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                err: "User not found"
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            success: true,
            user
        })
    } catch (error) {
        console.error("getMe error:", error);

        return res.status(500).json({
            message: "Something went wrong while fetching user details",
            success: false,
            error: error.message
        });
    }
}

/**
 * @route POST /api/auth/logout
 * @desc Clear the auth cookie and end the session
 * @access Private
 */
export async function logout(req, res) {
    res.clearCookie("token", AUTH_COOKIE_OPTIONS);

    return res.status(200).json({
        message: "Logged out successfully",
        success: true
    });
}

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address using verification token
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
    try {
        // Token comes from the URL query:
        // /verify-email?token=xxxxx
        const { token } = req.query;

        // Check whether verification token exists
        if (!token) {
            return res.status(400).json({
                message: "Verification token is required",
                success: false
            });
        }

        // Verify and decode JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user associated with the email inside the token
        const user = await User.findOne({
            email: decoded.email
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            });
        }

        // Mark user's email as verified
        user.isVerified = true;

        // Save updated verification status
        await user.save();

        // Verification successful — send the user back to the frontend login page
        return res.redirect(`${process.env.FRONTEND_URL}/login`);

    } catch (error) {
        console.error("Email verification error:", error);

        // Handle expired verification token
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({
                message: "Verification token has expired",
                success: false
            });
        }

        // Handle invalid JWT token
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({
                message: "Invalid verification token",
                success: false
            });
        }

        return res.status(500).json({
            message: "Something went wrong while verifying email",
            success: false,
            error: error.message
        });
    }
}
