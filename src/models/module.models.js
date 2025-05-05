import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    videoUrl: [{
        type: String,
        required: true
    }],
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    order: {
        type: Number,
    }
},{timestamps: true})

export const Module = mongoose.model('Module', moduleSchema)