import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { authJwt, authenticateUser } from "./middleware/authMiddleware.js";
import { check } from "./auth/checkSession.js";
import profileRoutes from "./widgets/charGen/profileRoutes.js";
import expenseRoutes from "./widgets/expenseTracker/expenseRoutes.js";
import settingsRoutes from "./widgets/settings/settingsRoutes.js";
import authRoutes from "./auth/authRoutes.js";

import osrsRoutes from "./videogames/osrs/osrsRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/check-session", check);
app.use("/profile", authJwt, authenticateUser, profileRoutes);
app.use("/expenses", authJwt, authenticateUser, expenseRoutes);
app.use("/widgetSettings", authJwt, authenticateUser, settingsRoutes);
app.use("/auth", authRoutes);
app.use("/osrs", osrsRoutes);
app.use("/", (req, res) => {
  res.send("Server up and running!");
});

export default app;

//leaving off on adding rate limiting and race conditions: https://www.npmjs.com/package/async-mutex
