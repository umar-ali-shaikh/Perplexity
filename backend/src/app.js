import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import chatRouter from "./routes/chat.routes.js";
import passport from "./config/passport.js";
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize());

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server Is running" })
})

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app;