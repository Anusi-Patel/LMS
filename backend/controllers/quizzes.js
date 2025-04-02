import Quiz from "../models/Quiz.js"
import Course from "../models/Course.js"
import Progress from "../models/Progress.js"

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Instructor, Admin)
export const createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, questions, timeLimit, passingScore } = req.body

    // Check if course exists and user is instructor
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create quiz for this course",
      })
    }

    const quiz = await Quiz.create({
      course: courseId,
      title,
      description,
      questions,
      timeLimit,
      passingScore,
    })

    res.status(201).json({
      success: true,
      data: quiz,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
export const getCourseQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId })

    res.status(200).json({
      success: true,
      data: quizzes,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get a single quiz
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      })
    }

    res.status(200).json({
      success: true,
      data: quiz,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor, Admin)
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      })
    }

    // Check if user is instructor of the course
    const course = await Course.findById(quiz.course)
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this quiz",
      })
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: updatedQuiz,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor, Admin)
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      })
    }

    // Check if user is instructor of the course
    const course = await Course.findById(quiz.course)
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this quiz",
      })
    }

    await quiz.remove()

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      })
    }

    const { answers } = req.body
    let score = 0

    // Calculate score
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++
      }
    })

    const percentage = (score / quiz.questions.length) * 100
    const passed = percentage >= quiz.passingScore

    // Update progress
    await Progress.findOneAndUpdate(
      {
        user: req.user.id,
        course: quiz.course,
      },
      {
        $push: {
          quizAttempts: {
            quiz: quiz._id,
            score: percentage,
            passed,
            answers,
          },
        },
      },
      { upsert: true }
    )

    res.status(200).json({
      success: true,
      data: {
        score: percentage,
        passed,
        correctAnswers: score,
        totalQuestions: quiz.questions.length,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
} 