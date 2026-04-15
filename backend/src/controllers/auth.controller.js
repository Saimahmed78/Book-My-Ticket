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

// GET /api/v1/auth/verify/:token
export const verifyAccount = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { email, name } = await AuthService.verifyEmail(token);

  const user = await User.findOne({ email });
  if (user) {
    const deviceId = getOrCreateDeviceId(req, res); // BUG FIX: pass res

    await ActivityService.recordActivity({
      req,
      user,
      event: "VERIFICATION_SUCCESS",
      deviceId, // BUG FIX: was missing entirely
    });
  }

  await MailService.sendVerificationConfirmationEmail({ email, name });

  return res
    .status(200)
    .json(new ApiResponse(200, "User verified successfully"));
});

// POST /api/v1/auth/resend-verification
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { name, verificationURL } = await AuthService.resendVerification(email);

  const user = await User.findOne({ email });
  if (user) {
    const deviceId = getOrCreateDeviceId(req, res); // BUG FIX: pass res

    await ActivityService.recordActivity({
      req,
      user,
      event: "VERIFICATION_RESEND",
      deviceId, // BUG FIX: was missing entirely
    });
  }

  await MailService.sendVerificationEmail({ name, email, verificationURL });

  return res
    .status(200)
    .json(new ApiResponse(200, "Verification email resent"));
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

// POST /api/v1/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const deviceId = getOrCreateDeviceId(req, res); // BUG FIX: pass res

  const { user, clearCookieOptions } = await AuthService.logout(userId);

  await ActivityService.recordActivity({
    req,
    user,
    event: "LOGOUT",
    deviceId, // BUG FIX: was missing entirely
  });

  res.clearCookie("accessToken", clearCookieOptions);
  res.clearCookie("refreshToken", clearCookieOptions);

  return res.status(200).json(new ApiResponse(200, "User logged out"));
});