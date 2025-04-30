import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(401, "Something went wrong")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    try {
        const {name, email, phone, password, role} = req.body

        if(!name || !email || !phone || !password || !role){
            throw new ApiError(401, "All fields are required")
        }

        const validRoles = ["Student", "Teacher"]
        if(!validRoles.includes(role)){
            return res
            .status(401)
            .json(new ApiResponse(
                401,
                {},
                "Invalid user role selected"
            ))
        }

        const userExists = await User.findOne({email})
        if(userExists) throw new ApiError(401, "User already exists");

        const newUser = new User({
            name,
            email,
            phone,
            password,
            role
        })
        await newUser.save()

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(newUser._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            201,
            {
                _id: newUser._id,
                name: newUser.name,
                phone: newUser.phone,
                email: newUser.email,
                role: newUser.role
            },
            "User registered successfully."
        ))
    } catch (error) {
        console.error("Failed to register user:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
    }
})

const loginUser = asyncHandler(async (req, res) => {
    try {
        const {email, password} = req.body
    
        if(!email || !password) {
            throw new ApiError(401, "All fields are required")
        }
    
        const user = await User.findOne({email})
        if(!user) throw new ApiError(401, "User not exist");
    
        const isPasswordValid = await user.isPasswordCorrect(password)
        if(!isPasswordValid) throw new ApiError(401, "Password not correct");
    
        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(201)
        .json(new ApiResponse(
            201,
            loggedInUser,
            "User logged in successfully."
        ))
    } catch (error) {
        console.error("Failed to log in user: ", error);
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: ""
                }
            },
            {new: true}
        )
    
        if(!user) throw new ApiError(401, "User not logged in")
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(
            201,
            {},
            "USer log out successfully"
        ))
    } catch (error) {
        console.error("Failed to log out user: ", error)
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body

        if(!oldPassword || !newPassword) throw new ApiError(401, "All fields are required");

        const user = await User.findById(req.user._id)
        if(!user) throw new ApiError(401, "User not exist");

        const isPasswordValid = await user.isPasswordCorrect(oldPassword)
        if(!isPasswordValid) throw new ApiError(401, "Password is incorrect");

        user.password = newPassword
        await user.save()

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            {},
            "Password changed successfully"
        ))
    } catch (error) {
        console.error("Failed to change password: ", error);
        
    }
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) throw new ApiError(401, "Unauthorized access");

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if(!user) throw new ApiError(401, "Refresh Token expired")

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            201,
            {accessToken, refreshToken},
            "Access Token refreshed"
        ))
    } catch (error) {
        console.error("Failed to refreshAccessToken: ", error);
    }
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const {name, phone} = req.body

    const updateDetails = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name,
                phone
            }
        },
        {new: true}
    ).select("-password, -refreshToken")

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        updateDetails,
        "User details updated successfully."
    ))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    refreshAccessToken,
    updateUserDetails
} 