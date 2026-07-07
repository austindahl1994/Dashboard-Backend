import bcrypt from "bcrypt";
import pool from "@/db/mysqlPool.js";

const SR = Number(process.env.SALT_ROUNDS ?? 10);

export type AWCUser = {
  id: number;
  email: string;
  role: "user" | "admin";
};

type AWCUserRow = {
  id: number;
  email: string;
  password_hash: string;
  role: "user" | "admin";
};

const getUserByEmail = async (email: string): Promise<AWCUserRow | null> => {
  const query =
    "SELECT id, email, password_hash, role FROM awcUsers WHERE email=? LIMIT 1";
  const [rows] = await pool.execute(query, [email]);
  const typedRows = rows as AWCUserRow[];
  return typedRows.length > 0 ? typedRows[0] : null;
};

const getUserById = async (id: number): Promise<AWCUser | null> => {
  const query = "SELECT id, email, role FROM awcUsers WHERE id=? LIMIT 1";
  const [rows] = await pool.execute(query, [id]);
  const typedRows = rows as AWCUser[];
  return typedRows.length > 0 ? typedRows[0] : null;
};

const updateLastLogin = async (id: number): Promise<void> => {
  const query = "UPDATE awcUsers SET last_login = CURRENT_TIMESTAMP WHERE id=?";
  await pool.execute(query, [id]);
};

const login = async (email: string, password: string): Promise<AWCUser> => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  await updateLastLogin(user.id);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
};

const createAWCUser = async (
  email: string,
  password: string,
  role: "user" | "admin",
): Promise<AWCUser> => {
  try {
    const passwordHash = await bcrypt.hash(password, SR);
    const query =
      "INSERT INTO awcUsers (email, password_hash, role) VALUES (?, ?, ?)";
    const [result] = await pool.execute(query, [email, passwordHash, role]);
    const insertId = (result as any).insertId;
    return {
      id: insertId,
      email,
      role,
    };
  } catch (error) {
    throw new Error("Error creating user");
  }
};

export { login, getUserById, getUserByEmail, createAWCUser };
