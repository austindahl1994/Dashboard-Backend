import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  getDiscordUserFromCode,
  tokenCookieOptions,
} from "@/services/discord/discord.ts";
import { getCabbageUserByDiscordId } from "./cabbage.ts";
import { addActiveUser, removeActiveUser, setupSse } from "../activeUsers.ts";

type CabbageSessionUser = {
  discord_id: string;
  discord_username: string;
  rsn: string;
  role: string;
  auth_type: "cabbage";
};

// Simple in-memory cache to prevent code reuse within a short window
// In production, use Redis or database for this
const recentlyCodes = new Set<string>();
const CODE_TIMEOUT_MS = 2000; // 2 seconds

const getSessionUserFromPayload = (
  payload: unknown,
): CabbageSessionUser | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("principal" in payload) {
    const principal = (payload as { principal?: unknown }).principal;

    if (
      principal &&
      typeof principal === "object" &&
      "discord_id" in principal
    ) {
      return principal as CabbageSessionUser;
    }
  }

  if ("discord_id" in payload) {
    return payload as CabbageSessionUser;
  }

  return null;
};

const issueCabbageSessionCookies = (
  res: Response,
  user: CabbageSessionUser,
) => {
  const token = jwt.sign(user, process.env.TOKEN_SECRET as string, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(
    { principal: user },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "30d",
    },
  );

  res.cookie("accessToken", token, {
    ...tokenCookieOptions,
    maxAge: 3600000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...tokenCookieOptions,
    maxAge: 2592000000,
  });

  return { token, refreshToken };
};

export const cabbageController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // console.log(
    //   "[Discord OAuth] Cabbage controller received code exchange request",
    // );
    const { code } = req.body as { code?: string };
    // console.log(
    //   "[Discord OAuth] Code received (first 10 chars):",
    //   code?.substring(0, 10) || "MISSING",
    // );

    if (!code || typeof code !== "string" || !code.trim()) {
      // console.log("[Discord OAuth] Missing Discord OAuth code in request body");
      res.status(400).json({ error: "Missing Discord OAuth code." });
      return;
    }

    // Prevent code reuse (deduplication for duplicate requests within 2 seconds)
    if (recentlyCodes.has(code)) {
      // console.log(
      //   "[Discord OAuth] Code reuse detected - duplicate request, rejecting",
      // );
      res.status(400).json({ error: "Code already exchanged or in progress." });
      return;
    }

    recentlyCodes.add(code);
    setTimeout(() => recentlyCodes.delete(code), CODE_TIMEOUT_MS);
    // console.log("[Discord OAuth] Code accepted for exchange");

    if (!process.env.TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      console.error("[Discord OAuth] Missing JWT environment variables");
      res.status(500).json({ error: "Missing JWT environment variables." });
      return;
    }

    // console.log("[Discord OAuth] Exchanging Discord code for user profile");
    const { discordUser } = await getDiscordUserFromCode(code);
    console.log("[Discord OAuth] Discord user profile received", {
      discord_id: discordUser.id,
      discord_username: discordUser.username,
      discord_avatar: discordUser.avatar,
    });

    // console.log("[Discord OAuth] Looking up Cabbage user in database");
    const cabbageUser = await getCabbageUserByDiscordId(discordUser.id);

    if (!cabbageUser) {
      console.log("[Discord OAuth] Discord user is not authorized for Cabbage");
      res.status(403).json({ error: "User is not authorized." });
      return;
    }

    console.log("[Discord OAuth] Cabbage user found", {
      discord_id: cabbageUser.discord_id,
      discord_username: cabbageUser.discord_username,
      rsn: cabbageUser.rsn,
      role: cabbageUser.role,
    });

    const user = {
      discord_id: cabbageUser.discord_id,
      discord_username: cabbageUser.discord_username ?? discordUser.username,
      rsn: cabbageUser.rsn,
      role: cabbageUser.role,
      auth_type: "cabbage",
    };

    // console.log("[Discord OAuth] Creating JWT access token and refresh token");

    const token = jwt.sign(user, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(
      { principal: user },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "30d",
      },
    );

    res.cookie("accessToken", token, {
      ...tokenCookieOptions,
      maxAge: 3600000,
    });

    // console.log("[Discord OAuth] Access token cookie set");

    res.cookie("refreshToken", refreshToken, {
      ...tokenCookieOptions,
      maxAge: 2592000000,
    });

    // console.log("[Discord OAuth] Refresh token cookie set");

    // console.log("[Discord OAuth] Cabbage OAuth flow completed successfully");
    res.status(200).json({
      token,
      refreshToken,
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Discord OAuth] Cabbage OAuth flow failed", {
      message,
      error,
    });
    const status = message.includes("not authorized")
      ? 403
      : message.includes("Missing environment variable")
        ? 500
        : 401;

    res.status(status).json({
      error: "Discord authentication failed.",
      details: message,
    });
  }
};

export const checkSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!process.env.TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    res.status(500).json({ error: "Missing JWT environment variables." });
    return;
  }

  if (!accessToken && !refreshToken) {
    res.status(401).json({ error: "No session token provided." });
    return;
  }

  try {
    if (accessToken) {
      const decodedAccess = jwt.verify(accessToken, process.env.TOKEN_SECRET);
      const sessionUser = getSessionUserFromPayload(decodedAccess);

      if (sessionUser) {
        res.status(200).json({ user: sessionUser, refreshed: false });
        return;
      }
    }

    if (!refreshToken) {
      res.status(401).json({ error: "Session expired." });
      return;
    }

    const decodedRefresh = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const refreshSessionUser = getSessionUserFromPayload(decodedRefresh);

    if (!refreshSessionUser) {
      res.status(401).json({ error: "Session expired." });
      return;
    }

    const { token } = issueCabbageSessionCookies(res, refreshSessionUser);

    res.status(200).json({ user: refreshSessionUser, refreshed: true, token });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Discord OAuth] Cabbage session check failed", {
      message,
      error,
    });
    res.status(401).json({ error: "Session expired." });
  }
};

export const cabbageEvents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    setupSse(res);

    let userId: string | undefined;
    let playerName: string | undefined;

    const accessToken = req.cookies?.accessToken;
    if (accessToken && process.env.TOKEN_SECRET) {
      try {
        const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);
        const sessionUser = getSessionUserFromPayload(decoded);
        if (sessionUser) {
          userId = sessionUser.discord_id;
          playerName = sessionUser.discord_username;
        }
      } catch {
        // Token stale or invalid — connect as anonymous
      }
    }

    const connectionId = addActiveUser(res, userId, playerName);
    console.log(
      `SSE connected: connectionId=${connectionId}, userId=${userId ?? "anonymous"}, playerName=${playerName ?? "anonymous"}`,
    );

    req.on("close", () => {
      removeActiveUser(connectionId);
      console.log(`SSE disconnected: connectionId=${connectionId}`);
    });
  } catch (error) {
    console.log(`Error creating cabbage SSE stream: ${error}`);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: `Error creating cabbage SSE stream: ${error}` });
    }
    res.end();
  }
};
