import mongoose from "mongoose"

const QuizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      options: [{
        type: String,
        required: true,
      }],
      correctAnswer: {
        type: Number,
        required: true,
        min: 0,
      },
      explanation: {
        type: String,
      },
    },
  ],
  timeLimit: {
    type: Number, // in minutes
    default: 30,
  },
  passingScore: {
    type: Number,
    default: 70,
  },
  maxAttempts: {
    type: Number,
    default: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Quiz = mongoose.model("Quiz", QuizSchema)

export default Quiz 