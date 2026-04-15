import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as AuthService from "../services/auth.service.js";

// POST /api/v1/auth/register
  export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const { user, verificationURL } = await AuthService.register({
      name,
      email,
      password,
    });

    
    return res
      .status(200)
      .json(new ApiResponse(200, "User registered & verification email sent"));
  });


// POST /api/v1/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;


  const {
    user,
    accessToken,
    refreshToken,
    accessCookieOptions,
    refreshCookieOptions,
  } = await AuthService.login({ email, password}, req); // BUG FIX: pass deviceId + req


  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.status(200).json(new ApiResponse(200, "User logged in"));
});

