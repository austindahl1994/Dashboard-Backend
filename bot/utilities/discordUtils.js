import dotenv from "dotenv";
dotenv.config();

const allowedUserIds = process.env.ALLOWED_USER_IDS
  ? process.env.ALLOWED_USER_IDS.split(",")
  : [];

const isUserAllowed = (userId) => {
  return allowedUserIds.includes(userId);
};
