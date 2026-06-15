import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type CabbageJwtPayload = {
  sub?: string;
  role?: string;
  [key: string]: unknown;
};

type CabbageRefreshPayload = {
  principal?: CabbageJwtPayload;
  [key: string]: unknown;
};

export interface CabbageRequest extends Request {
  cabbage?: CabbageJwtPayload;
}

const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

const getCookieToken = (
  cookies: Record<string, unknown> | undefined,
  name: string,
): string | null => {
  const token = cookies?.[name];
  return typeof token === "string" && token.length > 0 ? token : null;
};

const setCabbageContext = (req: CabbageRequest, payload: CabbageJwtPayload) => {
  req.cabbage = payload;
};

const cabbageMiddleware = (
  req: CabbageRequest,
  res: Response,
  next: NextFunction,
) => {
  const token =
    getBearerToken(req.headers.authorization) ??
    getCookieToken(
      req.cookies as Record<string, unknown> | undefined,
      "accessToken",
    );
  const refreshToken = getCookieToken(
    req.cookies as Record<string, unknown> | undefined,
    "refreshToken",
  );

  if (!token) {
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  const secret = process.env.TOKEN_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!secret || !refreshSecret) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    if (token) {
      const decoded = jwt.verify(token, secret) as CabbageJwtPayload;
      setCabbageContext(req, decoded);
      return next();
    }

    const refreshDecoded = jwt.verify(
      refreshToken as string,
      refreshSecret,
    ) as CabbageRefreshPayload;

    const principal = refreshDecoded.principal;

    if (!principal || typeof principal !== "object") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const newToken = jwt.sign(principal, secret, {
      expiresIn: "1h",
    });

    res.cookie("accessToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000,
    });

    setCabbageContext(req, principal);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default cabbageMiddleware;
