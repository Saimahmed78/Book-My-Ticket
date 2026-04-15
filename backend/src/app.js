import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pg from "pg";

import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";
import { seatsRoutes } from "./routes/seats.routes.js";
import { authRoutes } from "./routes/auth.routes.js";

dotenv.config({
  path: ".env", // relative path is /home/saimahmed/Desktop/Folder/.env
});
const app = express();
app.use(express.json())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["PUT", "DELETE", "OPTIONS", "GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "*"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/seats", seatsRoutes);
app.use((err, req, res, next) => {
  console.error("💥 Error Middleware Triggered:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      statusCode: err.statusCode,
      errors: err.errors || [],
    });
  }

  if (err.name === "ValidationError") {
    const fields = Object.keys(err.errors);
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${fields.join(", ")}`,
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
    });
  }
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    statusCode: 500,
  });
});

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR (255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE 
  );
  CREATE TABLE IF NOT EXISTS seats (
   id SERIAL PRIMARY KEY,
   seat_no SERIAL NOT NULL,
   is_booked BOOLEAN DEFAULT FALSE,
   booked_by INT REFERENCES users(id)
  )


`);

export { app, pool };
