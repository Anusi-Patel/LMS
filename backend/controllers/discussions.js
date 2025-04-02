import Discussion from "../models/Discussion.js"
import Course from "../models/Course.js"

// @desc    Get discussions for a course
// @route   GET /api/courses/:courseId/discussions
// @access  Private
export const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ course: req.params.courseId })
      .populate({
        path: "author",
        select: "name profilePicture",
      })
      .populate({
        path: "replies.author",
        select: "name profilePicture",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: discussions.length,
      data: discussions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single discussion
// @route   GET /api/discussions/:id
// @access  Private
export const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate({
        path: "author",
        select: "name profilePicture",
      })
      .populate({
        path: "replies.author",
        select: "name profilePicture",
      })

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    res.status(200).json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create a new discussion
// @route   POST /api/discussions
// @access  Private
export const createDiscussion = async (req, res) => {
  try {
    const { title, content } = req.body
    const courseId = req.params.courseId

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const discussion = await Discussion.create({
      course: courseId,
      author: req.user.id,
      title,
      content,
    })

    // Populate author information
    await discussion.populate("author", "name profilePicture")

    res.status(201).json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get all discussions for a course
// @route   GET /api/discussions/course/:courseId
// @access  Private
export const getCourseDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ course: req.params.courseId })
      .populate("author", "name profilePicture")
      .populate("replies.author", "name profilePicture")
      .sort("-createdAt")

    res.status(200).json({
      success: true,
      data: discussions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Add a reply to a discussion
// @route   POST /api/discussions/:id/replies
// @access  Private
export const addReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    // Check if user is enrolled in the course or is the instructor
    const course = await Course.findById(discussion.course)
    const isInstructor = course.instructor.toString() === req.user.id
    const isEnrolled = course.enrollments.some(
      enrollment => enrollment.student.toString() === req.user.id
    )

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to reply to discussions",
      })
    }

    discussion.replies.push({
      author: req.user.id,
      content: req.body.content,
      isInstructor,
    })

    await discussion.save()

    // Populate the new reply's author information
    await discussion.populate("replies.author", "name profilePicture")

    res.status(200).json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Mark discussion as resolved
// @route   PUT /api/discussions/:id/resolve
// @access  Private (Instructor, Admin)
export const resolveDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    // Check if user is instructor of the course
    const course = await Course.findById(discussion.course)
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to resolve this discussion",
      })
    }

    discussion.isResolved = true
    await discussion.save()

    res.status(200).json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Upvote a discussion
// @route   PUT /api/discussions/:id/upvote
// @access  Private
export const upvoteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      })
    }

    // Check if user has already upvoted
    const hasUpvoted = discussion.upvotes.includes(req.user.id)
    if (hasUpvoted) {
      discussion.upvotes = discussion.upvotes.filter(
        (id) => id.toString() !== req.user.id
      )
    } else {
      discussion.upvotes.push(req.user.id)
    }

    await discussion.save()

    res.status(200).json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

