import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    module:{
        type: Schema.Types.ObjectId,
        ref: 'Module'
    },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: String
    }],
    maxScore: {
        type: Number,
        default: 0
    }
},{timestamps: true})

export const Quiz = mongoose.model('Quiz', quizSchema)