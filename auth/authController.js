import * as am from "./auth.js";
import jwt from "jsonwebtoken";
import { createToken, createRefreshtoken } from "./jwtUtils.js";
import dotenv from "dotenv";
dotenv.config();

const TS = process.env.TOKEN_SECRET;

const login = async (req, res) => {
  //console.log(`Login request made`)
  const { email, password } = req.body;
  try {
    if (!email || !password) throw new Error("Need email and password");

    const user = await am.login(email, password);
    const accessToken = createToken(user.user_id, user.role, user.session_id);
    const refreshToken = createRefreshtoken(user.user_id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });

    const userData = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    // Object.keys((v) => {
    //   console.log(`${v}`)
    // });
    return res.status(200).json(userData);
  } catch (error) {
    console.error(`Error: ${error}`);
    return res.status(401).json({ message: `Some error: ${error}` });
  }
};

const logout = async (req, res) => {
  ////console.log("Cookies received in logout:", req.cookies);
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    //console.log(`No cookies passed in for logging out`);
    return res
      .status(401)
      .json({ message: "Cannot log out, no token provided" });
  }

  jwt.verify(accessToken, TS, async (err, user) => {
    if (err) {
      console.error("Invalid token during logout:", err);
      return res
        .status(400)
        .json({ message: "No valid token for logging out" });
    }

    try {
      await am.logout(user.user_id);
      res.cookie("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
        path: "/",
      });
      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
        path: "/",
      });

      return res.status(200).json({ message: "Successfully logged out." });
    } catch (error) {
      console.error(`Error logging out user: ${error}`);
      return res
        .status(500)
        .json({ message: "Server error, could not delete session ID" });
    }
  });
};

export { login, logout };
