import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { checkSessionId } from "./auth.js";
dotenv.config();

const TS = process.env.TOKEN_SECRET;

export const check = async (req, res) => {
  const accessToken = req.cookies.accessToken;

  console.log(`Checking session in check-session`);

  if (!accessToken) {
    console.log(`No token passed in`);
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(accessToken, TS, async (err, user) => {
    if (err) {
      return res.status(400).json({ message: "No valid token" });
    }

    try {
      const response = await checkSessionId(user.session_id, user.user_id);
      if (!response) {
        return res
          .status(401)
          .json({ message: "Session not found or expired" });
      }
      res.status(200).json({ message: "Authenticated", user });
    } catch (error) {
      console.error(`Error: ${error}`);
      res.status(500).json({ message: "Server error" });
    }
  });
};
