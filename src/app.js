import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { authJwt, authenticateUser } from "./middleware/authMiddleware.js";
import { check } from "./auth/checkSession.js";
import profileRoutes from "./widgets/charGen/profileRoutes.js";
import expenseRoutes from "./widgets/expenseTracker/expenseRoutes.js";
import settingsRoutes from "./widgets/settings/settingsRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import bingoRoutes from "./vingo/mvc/vingoRoutes.js";

import dotenv from "dotenv";
import battleshipRoutes from "./battleship/mvc/battleshipRoutes.ts";
dotenv.config();

//15 minutes, 100 requests per window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/bingo", bingoRoutes);
app.use("/battleship", battleshipRoutes);
app.use("/check-session", check);
app.use("/profile", authJwt, authenticateUser, profileRoutes);
app.use("/expenses", authJwt, authenticateUser, expenseRoutes);
app.use("/widgetSettings", authJwt, authenticateUser, settingsRoutes);
app.use("/auth", authRoutes);
app.use("/", (req, res) => {
  res.send("Server up and running!");
});

export default app;

//leaving off on adding rate limiting and race conditions: https://www.npmjs.com/package/async-mutex
