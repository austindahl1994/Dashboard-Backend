import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createToken } from "@/auth/jwtUtils.js";
import { getUserById, login as awcLogin } from "./awcModel.ts";

dotenv.config();

const RTS = process.env.REFRESH_TOKEN_SECRET;

const tokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

type AccessPayload = {
  user_id: number;
  role: "user" | "admin";
  iat?: number;
  exp?: number;
};

type RefreshPayload = {
  user_id: number;
  iat?: number;
  exp?: number;
};

const createAwcRefreshToken = (user_id: number): string => {
  if (!RTS) {
    throw new Error("Missing refresh token secret");
  }

  return jwt.sign({ user_id }, RTS, { expiresIn: "7d" });
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  console.log(`User attempted to login with data: ${email} and ${password}`);

  try {
    if (!email || !password) {
      res.status(400).json({ message: "Need email and password" });
      return;
    }

    const user = await awcLogin(email, password);
    const accessToken = createToken(user.id, user.role);
    const refreshToken = createAwcRefreshToken(user.id);

    res.cookie("accessToken", accessToken, {
      ...tokenCookieOptions,
      maxAge: 3600000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...tokenCookieOptions,
      maxAge: 604800000,
    });

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(401).json({ message });
  }
};

const session = async (req: Request, res: Response): Promise<void> => {
  const accessToken = req.cookies?.accessToken as string | undefined;
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (!accessToken && !refreshToken) {
    res.status(401).json({ message: "No session token provided" });
    return;
  }

  try {
    if (accessToken) {
      const decoded = jwt.verify(
        accessToken,
        process.env.TOKEN_SECRET as string,
      ) as AccessPayload;

      const user = await getUserById(decoded.user_id);
      if (!user) {
        res.status(401).json({ message: "Unauthorized: User not found" });
        return;
      }

      res.status(200).json({ user, refreshed: false });
      return;
    }
  } catch {
    // Access token invalid/expired; continue with refresh token path.
  }

  if (!refreshToken) {
    res.status(401).json({ message: "Session expired" });
    return;
  }

  try {
    if (!RTS) {
      throw new Error("Missing refresh token secret");
    }

    const decodedRefresh = jwt.verify(refreshToken, RTS) as RefreshPayload;
    const user = await getUserById(decodedRefresh.user_id);

    if (!user) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    const newAccessToken = createToken(user.id, user.role);
    res.cookie("accessToken", newAccessToken, {
      ...tokenCookieOptions,
      maxAge: 3600000,
    });

    res.status(200).json({ user, refreshed: true });
  } catch {
    res.status(401).json({ message: "Session expired" });
  }
};

export { login, session };
