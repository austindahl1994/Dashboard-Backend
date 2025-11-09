import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const TS = process.env.TOKEN_SECRET;

export const check = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  // console.log(`Checking for active user in checkSession`);
  if (!accessToken) {
    console.log(`No token passed in`);
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(accessToken, TS, async (err, user) => {
    if (err) {
      return res.status(400).json({ message: "No valid token" });
    }

    return res.status(200).json({ user });
  });
};
