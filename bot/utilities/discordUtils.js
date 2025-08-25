import dotenv from "dotenv";
dotenv.config();

export const allowedUserIds = process.env.ALLOWED_USER_IDS
  ? process.env.ALLOWED_USER_IDS.split(",")
  : [];

export const isUserAllowed = (userId) => {
  return allowedUserIds.includes(userId);
};
