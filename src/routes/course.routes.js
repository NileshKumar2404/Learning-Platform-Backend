import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createCourse, deleteCourse, enrollCourse, getAllCourses, getCourseById, getMyCourses, updateCourse } from "../controllers/course.controllers.js";

const router = Router()

router.route("/create-course").post(verifyJWT, createCourse)
router.route("/get-courses").get(verifyJWT, getAllCourses)
router.route("/get-courses/:courseId").get(verifyJWT, getCourseById)
router.route("/update-course/:courseId").patch(verifyJWT, updateCourse)
router.route("/delete-course/:courseId").delete(verifyJWT, deleteCourse)
router.route("/enroll-course/:courseId").post(verifyJWT, enrollCourse)
router.route("/get-my-course").get(verifyJWT, getMyCourses)

export default router