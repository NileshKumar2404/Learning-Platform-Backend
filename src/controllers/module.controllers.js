import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Course} from "../models/course.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Module } from "../models/module.models.js"
import mongoose from "mongoose"

//Only teacher
const createModule = asyncHandler(async (req, res) => {
    try {
        const { title, quizId, courseId, order } = req.body

        if(req.user.role !== "Teacher") {
            throw new ApiError(401, "Only teachers can create modules.")
        }

        if(!title || !courseId) throw new ApiError(401, "All these fields are required");

        const videos = req.files
        if (!videos || !videos.videoUrl || videos.videoUrl.length === 0) {
            throw new ApiError(400, "Video file is required.");
        }

        const videoLocalPath = videos.videoUrl[0].path;
        console.log("Local file path:", videoLocalPath);
        
        const uploadVideo = await uploadOnCloudinary(videoLocalPath)
        if(!uploadVideo) throw new ApiError(401, "Unable to upload video on cloudinary.");

        console.log(uploadVideo.url);

        const course = await Course.findById(courseId)
        if(!course) throw new ApiError(401, "Course not found.");

        let finalQuizId = null
        if(quizId && quizId.trim() !== "") finalQuizId = quizId;

        const createModule = await Module.create({
            title,
            videoUrl: uploadVideo.url,
            quizId: finalQuizId,
            course: courseId,
            order
        })

        if(!createModule) throw new ApiError(401, "Unable to create module.");

        course.modules.push(createModule._id)
        await course.save()

        return res
        .status(201)
        .json(new ApiResponse(
            201, 
            createModule,
            "Module created successfully."
        ))
    } catch (error) {
        console.error("Failed to create module: ", error);
    }
})

const getModulesByCourse = asyncHandler(async (req, res) => {
    try {
        const {courseId} = req.params

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new ApiError(400, "Invalid course ID.");
        }

        const course = await Course.findById(courseId)
        if(!course) throw new ApiError(401, "Course not found");

        const modules = await Module.find({course: courseId}).sort({order: 1})
        
        return res
        .status(200)
        .json(new ApiResponse(
            200, 
            modules,
            "Modules fetched successfully."
        ))
    } catch (error) {
        console.error("Failed to get modules: ", error);
    }
})

//Only teacher
const updateModule = asyncHandler(async (req, res) => {
    try {
        const {moduleId} = req.params

        if(req.user.role !== "Teacher") {
            throw new ApiError(401, "Only teachers can update modules.")
        }

        const updateModule = await Module.findByIdAndUpdate(
            moduleId,
            {
                $set: req.body
            },
            {new: true}
        )

        if (!updateModule) throw new ApiError(404, "Module not found.");

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            updateModule,
            "Module updated successfully."
        ))
    } catch (error) {
        console.error("Failed to update module: ", error);
    }
})

//Only Teacher
const deleteModule = asyncHandler(async (req, res) => {
    try {
        const {moduleId} = req.params
    
        if(req.user.role !== "Teacher") {
            throw new ApiError(401, "Only teachers can delete modules.")
        }
    
        const module = await Module.findByIdAndDelete(moduleId)
        if (!module) throw new ApiError(404, "Module not found.");
    
        await Course.updateOne(
            {_id: module.course},
            {
                $pull: {
                    modules: module._id
                }
            }
        )
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Module deleted successfully."
        ))
    } catch (error) {
        console.error("Failed to delete modules: ", error);
    }
})

const getAllModule = asyncHandler(async(req, res) => {
    try {
        if(req.user.role !== "Teacher") throw new ApiError(401, "You are not autorize to do this!!");
        
        const modules = await Module.aggregate([
            {
                $lookup: {
                    from: "courses",
                    localField: "course",
                    foreignField: "_id",
                    as: "courseDetails"
                }
            },
            {
                $unwind: {
                    path: "$courseDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    title: 1,
                    order: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    courseId: "$courseDetails._id",
                    courseName: "$courseDetails.name",
                    courseDuration: "$courseDetails.duration"
                }
            }
        ])
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            modules,
            "All modules get successfully"
        ))
    } catch (error) {
        console.error("Failed to get all the modules: ", error);
    }
})

export {
    createModule,
    getModulesByCourse,
    updateModule,
    deleteModule,
    getAllModule
}