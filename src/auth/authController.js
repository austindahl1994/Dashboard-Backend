import * as am from "./auth.js";
import jwt from "jsonwebtoken";
import { createToken, createRefreshtoken } from "./jwtUtils.js";
import dotenv from "dotenv";
dotenv.config();

const RTS = process.env.REFRESH_TOKEN_SECRET;

const tokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const login = async (req, res) => {
  console.log(`Login request made`);
  const { email, password } = req.body;
  try {
    if (!email || !password) throw new Error("Need email and password");

    const user = await am.login(email, password);
    const accessToken = createToken(user.user_id, user.role);
    const refreshToken = createRefreshtoken(user.user_id);

    res.cookie("accessToken", accessToken, {
      ...tokenCookieOptions,
      maxAge: 3600000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...tokenCookieOptions,
      maxAge: 2592000000,
    });
    //UPDATE: need to get both user information as well as user settings, pass both back to frontend
    const userData = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    // console.log(`Object data:`)
    // Object.keys(userData).map((k) => {
    //   console.log(`${k}:${userData[k]}`)
    // });
    // console.log(userData.username)
    return res.status(200).json(userData);
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(401).json({ message: `Some error: ${error}` });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  jwt.verify(refreshToken, RTS, async (err, payload) => {
    if (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    try {
      const userRows = await am.getUserById(payload.user_id);

      if (!Array.isArray(userRows) || userRows.length === 0) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      const user = userRows[0];
      if (!user || typeof user !== "object" || !("role" in user)) {
        return res.status(401).json({ message: "User role unavailable" });
      }

      const newAccessToken = createToken(payload.user_id, user["role"]);

      res.cookie("accessToken", newAccessToken, {
        ...tokenCookieOptions,
        maxAge: 3600000,
      });

      return res.status(200).json({ message: "Access token refreshed" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Error refreshing token: ${error}` });
    }
  });
};

const logout = async (req, res) => {
  try {
    res.cookie("accessToken", "", {
      ...tokenCookieOptions,
      expires: new Date(0),
      path: "/",
    });
    res.cookie("refreshToken", "", {
      ...tokenCookieOptions,
      expires: new Date(0),
      path: "/",
    });

    return res.status(200).json({ message: "Successfully logged out." });
  } catch (error) {
    console.error(`Error logging out user: ${error}`);
    return res.status(500).json({ message: "Server error, could not logout" });
  }
};

export { login, refresh, logout };
