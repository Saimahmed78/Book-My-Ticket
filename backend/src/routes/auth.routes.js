import { Router } from "express";
import {
  userloginValidators,
  userRegistrationValidators,
} from "../validators/auth.validators.js";

import validateRequest from "../middlewares/validateRequest.js";
import {
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";


const router = Router();

// --- Standard Auth ---
router.post(
  "/register",
  userRegistrationValidators(),
  validateRequest,
  registerUser,
);
router.post("/login", userloginValidators(), validateRequest, loginUser);


export { router as authRoutes };
