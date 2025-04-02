import mongoose from "mongoose"

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  lessons: [
    {
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: {
        type: Date,
      },
      timeSpent: {
        type: Number,
        default: 0,
      },
    },
  ],
  quizzes: [
    {
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        default: 0,
      },
      attempts: {
        type: Number,
        default: 0,
      },
      lastAttemptAt: {
        type: Date,
      },
    },
  ],
  assignments: [
    {
      assignment: {
        type: mongoose.Schema.Types.ObjectId,
      },
      submitted: {
        type: Boolean,
        default: false,
      },
      submissionUrl: {
        type: String,
      },
      grade: {
        type: Number,
      },
      feedback: {
        type: String,
      },
      submittedAt: {
        type: Date,
      },
      gradedAt: {
        type: Date,
      },
    },
  ],
  overallProgress: {
    type: Number,
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
})

// Calculate overall progress
ProgressSchema.methods.calculateProgress = function () {
  const totalItems = this.lessons.length + this.quizzes.length + this.assignments.length
  if (totalItems === 0) return 0

  const completedLessons = this.lessons.filter((lesson) => lesson.completed).length
  const completedQuizzes = this.quizzes.filter((quiz) => quiz.completed).length
  const submittedAssignments = this.assignments.filter((assignment) => assignment.submitted).length

  const completedItems = completedLessons + completedQuizzes + submittedAssignments
  this.overallProgress = Math.round((completedItems / totalItems) * 100)
  return this.overallProgress
}

const Progress = mongoose.model("Progress", ProgressSchema)

export default Progress

