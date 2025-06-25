import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Quiz } from "../models/quiz.models.js";
import {Course} from "../models/course.models.js"

//Only teacher
const createQuiz = asyncHandler(async (req, res) => {
    try {
        const {courseId, moduleId, questions} = req.body
    
        if(req.user.role !== "Teacher") throw new ApiError(401, "Only teacher can create quizzes.");
    
        if (!courseId || !moduleId || !questions || !Array.isArray(questions)) {
            throw new ApiError(400, "All fields are required and must be valid.");
        }
    
        const course = await Course.findById(courseId)
        if(!course) throw new ApiError(401, "Course not found.");
    
        const module = await Module.findById(moduleId)
        if(!module) throw new ApiError(401, "Module not found.");
    
        const maxScore = questions.length
    
        const newQuiz = await Quiz.create({
            course: courseId,
            module: moduleId,
            questions,
            maxScore
        })
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            newQuiz,
            "Quiz created successfully."
        ))
    } catch (error) {
        console.error("Failed to get quiz: ", error);
    }
})

const getQuizModuleId = asyncHandler(async (req, res) => {
    const {moduleId} = req.params

    const quiz = await Quiz.findOne({module: moduleId})

    if(!quiz) throw new ApiError(401, "Quiz not found.");

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        quiz,
        "Quiz fetched successfully."
    ))
})

const submitQuiz = asyncHandler(async (req, res) => {
    try {
        const {moduleId, answers} = req.body
    
        if (!moduleId || !answers || typeof answers !== 'object') {
            throw new ApiError(400, "Module ID and answers are required.");
        }
    
        const quiz = await Quiz.findOne({module: moduleId})
    
        if (!quiz) throw new ApiError(404, "Quiz not found.");
    
        let score = 0
    
        quiz.questions.forEach((question) => {
            const userAnswer = answers.find(ans => ans.questionId === String(question._id));
            if (userAnswer && userAnswer.selectedOption === question.correctAnswer) {
                score++;
            }
        });
        
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            {score, maxScore: quiz.maxScore},
            "Quiz submitted."
        ))
    } catch (error) {
        console.error("Failed to submit quiz: ", error);
    }
})

const getAllQuizzes = asyncHandler(async (req, res) => {
    if(req.user.role !== "Teacher") throw new ApiError(401, "Only teachers can get all quizzes.");

    const quizes = await Quiz.aggregate([
        {
            $lookup: {
                from: 'courses', 
                localField: 'course',
                foreignField: '_id',
                as: 'courseDetails'
            }
        },
        {
            $unwind: {
                path: '$courseDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'modules',
                localField: 'module',
                foreignField: '_id',
                as: 'moduleDetails'
            }
        },
        {
            $unwind: {
                path: '$moduleDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                course: '$courseDetails.name',
                module: '$moduleDetails.title',
                questions: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        quizes,
        "Quizzes are fetched successfully."
    ))
})

export {
    createQuiz,
    getQuizModuleId,
    submitQuiz,
    getAllQuizzes,
}