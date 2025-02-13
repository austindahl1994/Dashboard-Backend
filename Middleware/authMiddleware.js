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
      next();
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    next();
  }
};

//used for any post requests to check if they should have permissions
const authenticateUser = async (req, res, next) => {
  const user = req.user;
  try {
    if (!user || !user.user_id) throw new Error("No User or Id to validate");
    const data = await getUserById(user_id); //model to get user role from db
    if (!data) throw new Error("No user permissions found");
    if (data.role === "guest" && req.method !== "GET") {
      return res.status(403).json({ message: "No guest access" });
    }
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error with user permission: ${error}` });
  }
};

export { authJwt, authenticateUser };
