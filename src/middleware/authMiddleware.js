import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createToken } from "../auth/jwtUtils.js";
import * as am from "../auth/auth.js";
import { isUserAllowed } from "../bot/discordUtilities.js";
dotenv.config();

const TS = process.env.TOKEN_SECRET;
const RTS = process.env.REFRESH_TOKEN_SECRET;

const applyAuthContext = (req, user_id, role) => {
  req.user = { user_id, role };
  req.body ??= {};
  req.body.user_id = user_id;
  req.body.role = role;
};

const authJwt = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    // Try to verify access token
    if (accessToken) {
      jwt.verify(accessToken, TS, (err, user) => {
        if (!err) {
          // Access token is valid, continue
          applyAuthContext(req, user.user_id, user.role);
          return next();
        }

        // Access token is invalid/expired, try refresh token
        if (refreshToken) {
          jwt.verify(refreshToken, RTS, async (refreshErr, refreshPayload) => {
            if (refreshErr) {
              console.error(`Refresh token invalid: ${refreshErr}`);
              return res
                .status(401)
                .json({ message: "Unauthorized: Session expired" });
            }

            try {
              // Refresh token is valid, issue new access token
              const userRows = await am.getUserById(refreshPayload.user_id);
              if (
                !userRows ||
                (Array.isArray(userRows) && userRows.length === 0)
              ) {
                return res
                  .status(401)
                  .json({ message: "Unauthorized: User not found" });
              }

              const user = Array.isArray(userRows) ? userRows[0] : userRows;
              const role =
                user && typeof user === "object" && "role" in user
                  ? user.role
                  : undefined;
              const newAccessToken = createToken(refreshPayload.user_id, role);

              res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 3600000,
              });

              // Set user data and continue
              applyAuthContext(req, refreshPayload.user_id, role);
              return next();
            } catch (error) {
              console.error(`Error refreshing token: ${error}`);
              return res
                .status(401)
                .json({ message: "Unauthorized: Token refresh failed" });
            }
          });
        } else {
          // No refresh token available
          console.log(`No refresh token available`);
          return res
            .status(401)
            .json({ message: "Unauthorized: No token provided" });
        }
      });
    } else {
      // No access token at all
      console.log(`No access token passed into middleware`);
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
  } catch (error) {
    console.error(`Error with JWT auth: ${error}`);
    return res
      .status(400)
      .json({ message: `Error with user permission: ${error}` });
  }
};

//used for any post requests to check if they should have permissions
const authenticateUser = async (req, res, next) => {
  const user_id = req.user?.user_id ?? req.body.user_id;
  const role = req.user?.role ?? req.body.role;
  // console.log(`Attempting to auth user based on role`)
  try {
    if (!user_id) throw new Error("No User or Id to validate");
    if (!role) throw new Error("No user permissions found");
    // console.log(`User has a role: ${role}`)
    if (role === "guest" && req.method !== "POST") {
      // console.log(`Guest access`)
      return res.status(403).json({ message: "No guest access" });
    }
    //console.log(`User Authenticated, continue`)
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error with user permission: ${error}` });
  }
};

const playerAuthJWT = (req, res, next) => {
  const passcode = req.body.passcode;
  // console.log(`Attempting to auth player with token: ${passcode}`);
  //console.log(`Checking session in middleware`);
  try {
    if (!passcode) {
      console.log(`No passcode token passed into middleware`);
      return res
        .status(401)
        .json({ message: "Unauthorized: No passcode provided" });
    }
    jwt.verify(passcode, TS, (err, user) => {
      if (err) {
        console.error(`Error: ${err}`);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
      req.body ??= {};
      req.body.rsn = user.rsn;
      req.body.team = user.team;
      req.body.discord_id = user.discord_id;
      const role = isUserAllowed(String(user.discord_id)) ? "admin" : "player";
      req.body.role = role;
      // console.log(
      //   `Verified player data: RSN:${user.rsn}, TEAM:${user.team}, DISCORD:${user.discord_id}`
      // );
      next();
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error with user permission: ${error}` });
  }
};

export { authJwt, authenticateUser };
