import dotenv from "dotenv";
dotenv.config();

export const allowedUserIds = process.env.ALLOWED_USER_IDS
  ? process.env.ALLOWED_USER_IDS.split(",").map((id) => id.trim())
  : [];

export const isUserAllowed = (discordId) => {
  return (
    allowedUserIds &&
    allowedUserIds.length > 0 &&
    allowedUserIds.includes(discordId)
  );
};
