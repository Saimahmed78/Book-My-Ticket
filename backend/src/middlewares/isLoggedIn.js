import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
const isLoggedIn = async (req, res, next) => {
   console.log("Checking if user is logged In")
  // Check if cookies has accessToken
  const accessToken = req.cookies?.accessToken;
  
  // If yes then return next
  if (accessToken) {
    try {
      const decodedData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decodedData;
    } catch (err) {
      throw new ApiError(401, "Token is invalid", err);
    }
    return next();
  }
  console.log("Access Token found sending request to refresh Token")
  // If not, refresh the access token
  let decodedRefresh;
    try {
      decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new ApiError(401, "Refresh Token is invalid");
    }
  req.user = decodedRefresh
  next();
};

export { isLoggedIn};