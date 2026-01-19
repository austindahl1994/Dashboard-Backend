import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const TS = process.env.TOKEN_SECRET;
const RTS = process.env.REFRESH_TOKEN_SECRET;

const authJwt = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  //console.log(`Checking session in middleware`);
  try {
    if (!accessToken) {
      console.log(`No token passed into middleware`);
    }
    jwt.verify(accessToken, TS, (err, user) => {
      if (err) {
        console.error(`Error: ${err}`);
      }
      //console.log(`No error validating JWT`);
      req.body.user_id = user.user_id;
      req.body.role = user.role;
      // console.log(
      //   `User info: id: ${user.user_id} role: ${user.role} `
      // );
      next();
    });
  } catch (error) {
    console.error(`Error with JWT auth: ${error}`);
    return res
      .status(400)
      .json({ message: `Error with user permission: ${error}` });
  }
};

//used for any post requests to check if they should have permissions
const authenticateUser = async (req, res, next) => {
  const user_id = req.body.user_id;
  const role = req.body.role;
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
    }
    jwt.verify(passcode, TS, (err, user) => {
      if (err) {
        console.error(`Error: ${err}`);
      }
      req.body.rsn = user.rsn;
      req.body.team = user.team;
      req.body.discord_id = user.discord_id;
      let role;
      if (process.env.ALLOWED_USER_IDS?.includes(user.discord_id)) {
        role = "admin";
      } else {
        role = "player";
      }
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

export { authJwt, authenticateUser, playerAuthJWT };
