import Course from "../models/Course.js"
import User from "../models/User.js"
import Progress from "../models/Progress.js"

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { category, search, difficulty, sort } = req.query

    // Build query
    const query = {}

    // Filter by category
    if (category && category !== "all") {
      query.category = category
    }

    // Filter by difficulty
    if (difficulty && difficulty !== "all") {
      query.difficulty = difficulty
    }

    // Filter by search term
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Only show published courses for non-admin users
    if (!req.user || req.user.role !== "admin") {
      query.isPublished = true
    }

    // Build sort object
    let sortOptions = {}
    if (sort) {
      switch (sort) {
        case "newest":
          sortOptions = { createdAt: -1 }
          break
        case "oldest":
          sortOptions = { createdAt: 1 }
          break
        case "price-low":
          sortOptions = { price: 1 }
          break
        case "price-high":
          sortOptions = { price: -1 }
          break
        case "rating":
          sortOptions = { averageRating: -1 }
          break
        default:
          sortOptions = { createdAt: -1 }
      }
    } else {
      sortOptions = { createdAt: -1 }
    }

    // Pagination
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const courses = await Course.find(query)
      .populate("instructor", "name profilePicture")
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limit)

    const total = await Course.countDocuments(query)

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      data: courses,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email profilePicture")
      .populate("enrollments.student", "name profilePicture")

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor, Admin)
export const createCourse = async (req, res) => {
  try {
    // Add user to req.body
    req.body.instructor = req.user.id

    // Check for published courses by the user
    const publishedCourses = await Course.find({
      instructor: req.user.id,
    })

    // If the user is not an admin, they can only create 5 courses
    if (publishedCourses.length >= 5 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already published 5 courses`,
      })
    }

    const course = await Course.create(req.body)

    res.status(201).json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor, Admin)
export const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this course`,
      })
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor, Admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this course`,
      })
    }

    await course.remove()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Add lesson to course
// @route   POST /api/courses/:id/lessons
// @access  Private (Instructor, Admin)
export const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to add lessons to this course`,
      })
    }

    // Add lesson to course
    course.lessons.push(req.body)
    await course.save()

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    const user = await User.findById(req.user.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is already enrolled
    const isEnrolled = user.enrolledCourses.some((enrolledCourse) => enrolledCourse.course.toString() === req.params.id)

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: "User already enrolled in this course",
      })
    }

    // Add user to course enrollments
    course.enrollments.push({
      student: req.user.id,
    })

    // Add course to user enrolledCourses
    user.enrolledCourses.push({
      course: req.params.id,
    })

    // Create progress tracking for this enrollment
    const progress = await Progress.create({
      user: req.user.id,
      course: req.params.id,
      lessons: course.lessons.map((lesson) => ({
        lesson: lesson._id,
      })),
      quizzes: course.quizzes.map((quiz) => ({
        quiz: quiz._id,
      })),
      assignments: course.assignments.map((assignment) => ({
        assignment: assignment._id,
      })),
    })

    console.log('Created progress document:', progress)

    await course.save()
    await user.save()

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Rate course
// @route   POST /api/courses/:id/ratings
// @access  Private (Enrolled Students)
export const rateCourse = async (req, res) => {
  try {
    const { rating, review } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is enrolled in the course
    const isEnrolled = course.enrollments.some((enrollment) => enrollment.student.toString() === req.user.id)

    if (!isEnrolled) {
      return res.status(401).json({
        success: false,
        message: "You must be enrolled in the course to rate it",
      })
    }

    // Check if user has already rated the course
    const alreadyRated = course.ratings.find((rating) => rating.user.toString() === req.user.id)

    if (alreadyRated) {
      // Update existing rating
      alreadyRated.rating = rating
      alreadyRated.review = review
    } else {
      // Add new rating
      course.ratings.push({
        rating,
        review,
        user: req.user.id,
      })
    }

    // Calculate average rating
    course.getAverageRating()

    await course.save()

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

