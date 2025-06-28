import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createQuiz, getAllQuizzes, getQuizModuleId, submitQuiz } from "../controllers/quiz.controllers.js";

const router = Router()

router.route("/create-quiz").post(verifyJWT, createQuiz)
router.route("/get-quiz/:moduleId").get(verifyJWT, getQuizModuleId)
router.route("/submit-quiz").post(verifyJWT, submitQuiz)
router.route("/get-quizzes").get(verifyJWT, getAllQuizzes)

export default router