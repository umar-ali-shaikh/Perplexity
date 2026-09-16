import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import chatRouter from "./routes/chat.routes.js";
const app = express();

// Middleware
app.use(cors({
    origin: /^http:\/\/localhost:517\d$/,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server Is running" })
})

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

export default app;