// import {asyncHandler} from "../utils/asyncHandler.js"
// import jwt from 'jsonwebtoken'
// import {ApiError} from "../utils/ApiError.js"

// export const verifyJWT = asyncHandler(async(req, _, next) => {
//     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

//     if(!token) throw new ApiError(401, "Unauthorized access")
// })