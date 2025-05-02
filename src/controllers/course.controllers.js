import {asyncHandler} from "../utils/asyncHandler.js"
import {Course} from "../models/course.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose"

//Only for teacher
const createCourse = asyncHandler(async (req, res) => {
    try {
        const {name, duration, courseFees, description, category} = req.body

        if(req.user.role !== "Teacher") throw new ApiError(401, "You are not authorized to create courses");

        if(!name || !duration || !courseFees || !description || !category) throw new ApiError(401, "All fields are required");

        const newCourse = await Course.create({
            name, 
            duration,
            courseFees,
            description,
            category,
            modules: [],
            studentsEnrolled: []
        })

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            newCourse,
            "Course created successfully."
        ))
    } catch (error) {
        console.error("Failed to create course: ", error);
        
    }
})

const getAllCourses = asyncHandler(async (req, res) => {
    try {
        const getCourse = await Course.aggregate([
            {
                $lookup: {
                    from: "modules",
                    localField: "modules",
                    foreignField: "_id",
                    as: "moduleDetails"
                }
            },
            {
                $project: {
                    name: 1,
                    duration: 1,
                    courseFees: 1,
                    description: 1,
                    category: 1,
                    moduleDetails: 1,
                    studentsEnrolledCount: {
                        $size: {
                            $ifNull: ["$studentsEnrolled", []]
                        }
                    },
                    createdAt: 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            getCourse,
            "Get all courses successfully."
        ))
    } catch (error) {
        console.error("Failed to get all courses: ", error);
    }
})

const getCourseById = asyncHandler(async (req, res) => {
    const {courseId} = req.params

    try {
        const getCourses = await Course.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $lookup: {
                    from: "modules",
                    localField: "modules",
                    foreignField: "_id",
                    as: "moduleDetails"
                }
            },
            {
                $project: {
                    name: 1,
                    duration: 1,
                    courseFees: 1,
                    description: 1,
                    category: 1,
                    moduleDetails: 1,
                    studentsEnrolledCount: {
                        $size: {
                            $ifNull: ["$studentsEnrolled", []]
                        }
                    },
                    createdAt: 1
                }
            },
        ])

        if(!getCourses || getCourses.length == 0) throw new ApiError(401, "Course not found");

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            getCourses,
            "Get courses by id successfully."
        ))
    } catch (error) {
        console.error("Failed to get courses by id: ", error);
    }
})

//Only for teacher
const updateCourse = asyncHandler(async (req, res) => {
    const {courseId} = req.params

    const updateCourse = await Course.findByIdAndUpdate(
        courseId,
        {
            $set: req.body
        },
        {new: true}
    )

    if(!updateCourse) throw new ApiError(401, "Course not found");

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        updateCourse,
        "Course updated successfully."
    ))
})

//Only for teacher
const deleteCourse = asyncHandler(async (req, res) => {
    const {courseId} = req.params

    try {
        if(req.user.role !== "Teacher") {
            throw new ApiError(401, "Only teachers can delete courses")
        }

        const deleteCourse = await Course.findByIdAndDelete(courseId)

        if(!deleteCourse) throw new ApiError(401, "Course not found");

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            {},
            "Course deleted successfully."
        ))
    } catch (error) {
        console.error("Failed to delete the course: ", error);
        
    }
})

const enrollCourse = asyncHandler(async (req, res) => {
    try {
        const {courseId} = req.params

        if (req.user.role !== "Student") {
            throw new ApiError(401, "Only students can enroll in course.")
        }

        const course = await Course.findById(courseId)
        if(!course) throw new ApiError(401, "Course not found");

        //Check the student is already enrolled or not
        if(course.studentsEnrolled.includes(req.user._id)){
            throw new ApiError(401, "Student already enrolled in this course.")
        }

        course.studentsEnrolled.push(req.user._id)
        await course.save()

        await User.findByIdAndUpdate(
            req.user._id, 
            {
                $push: {
                    enrolledCourses: course._id
                }
            }
        )

        return res
        .status(201)
        .json(new ApiResponse(
            201, 
            {},
            "Successfully enrolled in course."
        ))
    } catch (error) {
        console.error("Failed to enroll in course: ", error);
    }
})

const getMyCourses = asyncHandler(async (req, res) => {
    try {
        if(req.user.role !== "Student") {
            throw new ApiError(401, "Only students can view enrolled courses.")
        }

        const userCourses = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'enrolledCourses',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            {
                $project: {
                    courseDetails: 1
                }
            }
        ])

        //If user exists and has enrolledCourseDetails, use it — otherwise, just give me an empty list.
        const courses = userCourses[0]?.courseDetails || []

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            courses,
            "Your enrolled courses."
        ))
    } catch (error) {
        console.error("Failed to get courses: ", error);
    }
})

export {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    enrollCourse,
    getMyCourses
}
