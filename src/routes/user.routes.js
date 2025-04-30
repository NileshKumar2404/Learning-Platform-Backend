import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { changeCurrentPassword, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserDetails } from "../controllers/user.controllers.js";

const router = Router()

router.route("/register-user").post(registerUser)
router.route("/login-user").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/refresh-token").post(verifyJWT, refreshAccessToken)
router.route("/update-details").post(verifyJWT, updateUserDetails)

export default router