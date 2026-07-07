import dotenv from "dotenv";
import { createAWCUser, getUserByEmail } from "./awcModel.ts";

dotenv.config();

const getRequiredEnv = (): {
  email: string;
  password: string;
  role: "admin" | "user";
} => {
  const email = process.env.AWC_EMAIL;
  const password = process.env.AWC_PASS;
  const role = (process.env.AWC_ROLE || "user").trim().toLowerCase();

  if (!email || !password) {
    throw new Error("AWC_EMAIL and AWC_PASS are required in .env");
  }

  if (role !== "admin" && role !== "user") {
    throw new Error(
      `AWC_ROLE must be 'admin' or 'user'. Received '${process.env.AWC_ROLE}'`,
    );
  }

  return { email, password, role };
};

const createInitialAwcUser = async (): Promise<void> => {
  const { email, password, role } = getRequiredEnv();
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    console.log(`AWC initial user already exists for email: ${email}`);
    return;
  }

  await createAWCUser(email, password, role);
  console.log(`AWC initial user created for email: ${email}`);
};

export default createInitialAwcUser;
