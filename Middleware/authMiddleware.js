import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const TS = process.env.TOKEN_SECRET;
const RTS = process.env.REFRESH_TOKEN_SECRET;

const authJwt = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  console.log(`Checking session in middleware`);
  try {
    if (!accessToken) {
      console.log(`No token passed in`);
    }
    jwt.verify(accessToken, TS, (err, user) => {
      if (err) {
        console.error(`Error: ${err}`);
      }
      console.log(`No error validating JWT`);
      req.body.user_id = user.user_id
      req.body.role = user.role
      console.log(
        `User info: id: ${user.user_id} role: ${user.role} `
      );
      next();
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    next();
  }
};

//used for any post requests to check if they should have permissions
const authenticateUser = async (req, res, next) => {
  const user_id = req.body.user_id
  const role = req.body.role
  console.log(`Attempting to auth user`)
  try {
    if (!user_id) throw new Error("No User or Id to validate");
    if (!role) throw new Error("No user permissions found");
    console.log(`User has a role: ${role}`)
    if (role === "guest" && req.method !== "POST") {
      console.log(`Guest access`)
      return res.status(403).json({ message: "No guest access" });
    }
    console.log(`User info checks out, continue`)
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error with user permission: ${error}` });
  }
};

export { authJwt, authenticateUser };
