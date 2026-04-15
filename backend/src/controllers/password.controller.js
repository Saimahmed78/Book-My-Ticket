import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as PasswordService from "../services/password.service.js";

// POST /api/v1/password/forgot
export const forgotPassword = asyncHandler(async (req, res) => {
  console.log("Forgot password controller");
  const { email } = req.body;
  const { name, resetURL } = await PasswordService.forgotPassword(email);

  await MailService.sendPasswordResetEmail({ name, email, resetURL });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset email sent"));
});

// POST /api/v1/password/reset/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const { email, name } = await PasswordService.resetPassword({
    token,
    newPassword: password,
  });
  await MailService.sendPasswordResetConfirmationEmail({ email, name });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});

// POST /api/v1/password/change
export const changePassword = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new ApiError(401, "Unauthorized");
  console.log("Change password controller for user ID:", req.user.id);
  const { oldPass, newPass } = req.body;
  const payload = await PasswordService.changePassword({
    userId: req.user.id,
    oldPass,
    newPass,
  });

  // Clear tokens after password change (force re-login)
  res.clearCookie("accessToken", payload.clearCookieOptions);
  res.clearCookie("refreshToken", payload.clearCookieOptions);
  res.clearCookie("deviceId", payload.clearCookieOptions);
  await MailService.sendPasswordChangeEmail(payload);
  console.log("Password change successful, response sent.");
  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});
