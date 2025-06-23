import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";
import { createModule, deleteModule, getAllModule, getModulesByCourse, updateModule } from "../controllers/module.controllers.js";

const router = Router()

router.route("/create-module").post(
    upload.fields([
        {
            name: "videoUrl",
            maxCount: 1
        }
    ]), 
    verifyJWT,
    createModule
)
router.route("/get-module/:courseId").get(verifyJWT, getModulesByCourse)
router.route("/update-module/:moduleId").patch(verifyJWT, updateModule)
router.route("/delete/:moduleId").delete(verifyJWT, deleteModule)
router.route("/get-all-modules").get(verifyJWT, getAllModule)

export default router