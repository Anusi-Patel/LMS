import Progress from "../models/Progress.js"
import Course from "../models/Course.js"
import User from "../models/User.js"
import Certificate from "../models/Certificate.js"

// @desc    Get user progress for a course
// @route   GET /api/progress/:courseId
// @access  Private
export const getProgress = async (req, res) => {
  try {
    console.log('Getting progress for user:', req.user.id, 'course:', req.params.courseId)
    
    // Check if course exists
    const course = await Course.findById(req.params.courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is enrolled
    const isEnrolled = course.enrollments.some(
      enrollment => enrollment.student.toString() === req.user.id
    )

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to view progress",
      })
    }

    let progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    })

    // If no progress exists, create one
    if (!progress) {
      progress = await Progress.create({
        user: req.user.id,
        course: req.params.courseId,
        lessons: course.lessons.map(lesson => ({
          lesson: lesson._id,
        })),
        quizzes: course.quizzes.map(quiz => ({
          quiz: quiz._id,
        })),
        assignments: course.assignments.map(assignment => ({
          assignment: assignment._id,
        })),
      })
    }

    console.log('Found/created progress:', progress)

    res.status(200).json({
      success: true,
      data: progress,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update lesson progress
// @route   PUT /api/progress/:courseId/lessons/:lessonId
// @access  Private
export const updateLessonProgress = async (req, res) => {
  try {
    const { completed, timeSpent } = req.body

    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    })

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      })
    }

    // Find the lesson in the progress
    const lessonIndex = progress.lessons.findIndex((lesson) => lesson.lesson.toString() === req.params.lessonId)

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in progress",
      })
    }

    // Update lesson progress
    progress.lessons[lessonIndex].completed = completed || progress.lessons[lessonIndex].completed
    progress.lessons[lessonIndex].timeSpent = (progress.lessons[lessonIndex].timeSpent || 0) + (timeSpent || 0)

    if (completed && !progress.lessons[lessonIndex].completedAt) {
      progress.lessons[lessonIndex].completedAt = Date.now()
    }

    // Update last accessed
    progress.lastAccessedAt = Date.now()

    // Calculate overall progress
    progress.calculateProgress()

    await progress.save()

    // Check if all lessons are completed to issue certificate
    const allLessonsCompleted = progress.lessons.every((lesson) => lesson.completed)
    const allQuizzesCompleted = progress.quizzes.every((quiz) => quiz.completed)

    if (allLessonsCompleted && allQuizzesCompleted && progress.overallProgress === 100) {
      // Check if certificate already exists
      const certificateExists = await Certificate.findOne({
        user: req.user.id,
        course: req.params.courseId,
      })

      if (!certificateExists) {
        // Create certificate
        const certificate = await Certificate.create({
          user: req.user.id,
          course: req.params.courseId,
        })

        // Add certificate to user
        const user = await User.findById(req.user.id)
        user.certificates.push(certificate._id)
        await user.save()
      }
    }

    res.status(200).json({
      success: true,
      data: progress,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Submit quiz
// @route   POST /api/progress/:courseId/quizzes/:quizId
// @access  Private
export const submitQuiz = async (req, res) => {
  try {
    const { answers, score } = req.body

    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    })

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      })
    }

    // Find the quiz in the progress
    const quizIndex = progress.quizzes.findIndex((quiz) => quiz.quiz.toString() === req.params.quizId)

    if (quizIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found in progress",
      })
    }

    // Get the course to check passing score
    const course = await Course.findById(req.params.courseId)
    const quiz = course.quizzes.id(req.params.quizId)

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found in course",
      })
    }

    // Update quiz progress
    progress.quizzes[quizIndex].score = score
    progress.quizzes[quizIndex].attempts += 1
    progress.quizzes[quizIndex].lastAttemptAt = Date.now()

    // Mark as completed if score is above passing score
    if (score >= quiz.passingScore) {
      progress.quizzes[quizIndex].completed = true
    }

    // Update last accessed
    progress.lastAccessedAt = Date.now()

    // Calculate overall progress
    progress.calculateProgress()

    await progress.save()

    res.status(200).json({
      success: true,
      data: progress,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Submit assignment
// @route   POST /api/progress/:courseId/assignments/:assignmentId
// @access  Private
export const submitAssignment = async (req, res) => {
  try {
    const { submissionUrl } = req.body

    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    })

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      })
    }

    // Find the assignment in the progress
    const assignmentIndex = progress.assignments.findIndex(
      (assignment) => assignment.assignment.toString() === req.params.assignmentId,
    )

    if (assignmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found in progress",
      })
    }

    // Update assignment progress
    progress.assignments[assignmentIndex].submitted = true
    progress.assignments[assignmentIndex].submissionUrl = submissionUrl
    progress.assignments[assignmentIndex].submittedAt = Date.now()

    // Update last accessed
    progress.lastAccessedAt = Date.now()

    // Calculate overall progress
    progress.calculateProgress()

    await progress.save()

    res.status(200).json({
      success: true,
      data: progress,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Grade assignment
// @route   PUT /api/progress/:courseId/assignments/:assignmentId/grade
// @access  Private (Instructor, Admin)
export const gradeAssignment = async (req, res) => {
  try {
    const { grade, feedback } = req.body
    const { userId } = req.params

    // Get the course to check if user is instructor
    const course = await Course.findById(req.params.courseId)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to grade assignments for this course`,
      })
    }

    const progress = await Progress.findOne({
      user: userId,
      course: req.params.courseId,
    })

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      })
    }

    // Find the assignment in the progress
    const assignmentIndex = progress.assignments.findIndex(
      (assignment) => assignment.assignment.toString() === req.params.assignmentId,
    )

    if (assignmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found in progress",
      })
    }

    // Update assignment grade
    progress.assignments[assignmentIndex].grade = grade
    progress.assignments[assignmentIndex].feedback = feedback
    progress.assignments[assignmentIndex].gradedAt = Date.now()

    await progress.save()

    res.status(200).json({
      success: true,
      data: progress,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getLessonProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    const lesson = progress.lessons.find(
      (lesson) => lesson.lesson.toString() === req.params.lessonId
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson progress not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
