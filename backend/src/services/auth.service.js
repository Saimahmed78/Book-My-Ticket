import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { pool } from "../app.js";
import { hashPassword, isPasswordCorrect } from "./password.service.js";
import { generateToken } from "./token.service.js";
const isProd = process.env.NODE_ENV === "production";

const cookieOptionsBase = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

export async function register({ name, email, password }) {
  const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rowCount > 0)
    throw new ApiError(409, "Registration failed", ["User already exists"]);

  const hashedPassword = await hashPassword(password);
  console.log("hashed password", hashedPassword);
  const user = await pool.query(
    "INSERT INTO users (name,email,hashed_password) VALUES ($1,$2,$3)",
    [name, email, hashedPassword],
  );
  console.log("User saved", user);
  return { user };
}

export async function login({ email, password }, req) {
  const user = await pool.query("SELECT * FROM users WHERE email= $1", [email]);
  console.log("Current User Is", user.rows[0]);
  const currentUser = user.rows[0];
  if (user.rowCount == 0) throw new ApiError(404, "User does not exist");

  const isValid = await isPasswordCorrect(
    password,
    currentUser.hashed_password,
  );
  if (!isValid) throw new ApiError(400, "Email or password is incorrect");

  const accessToken = generateToken("access", user);
  const { refreshToken } = generateToken("refresh", user);

  const accessCookieOptions = {
    ...cookieOptionsBase,
    maxAge: 15 * 60 * 1000,
  };
  const refreshCookieOptions = {
    ...cookieOptionsBase,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  return {
    user,
    accessToken,
    refreshToken,
    accessCookieOptions,
    refreshCookieOptions,
  };
}

export async function logout(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  await Session.deleteMany({ userId: user._id });

  const userSecurity = await UserSecurity.findOne({ userId: user._id });
  if (userSecurity) {
    await userSecurity.save();
  }

  return { user, clearCookieOptions: cookieOptionsBase };
}
