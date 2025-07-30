import { ApiError } from "../utils/ApiErrors";
import { asyncHandler } from "../utils/AsyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req,res,next) => {

  try {
     const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
     if(!token){
      throw new ApiError(401, "Unauthorized request")
     };
  
    const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // might be needed await!
  
    const user =  await User.findById(decodedToken?._id).select("-password -refreshToken");
  
    if(!user){
      throw new ApiError(401, "Invalid Access Token")
    };
  
    req.user = user; // added another property in user so i can access for further process (like logout user )
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
  }
}) 