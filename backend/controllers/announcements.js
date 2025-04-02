import Announcement from "../models/Announcement.js"
import Course from "../models/Course.js"

// @desc    Get announcements for a course
// @route   GET /api/courses/:courseId/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ course: req.params.courseId })
      .populate({
        path: "author",
        select: "name profilePicture",
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Create announcement
// @route   POST /api/courses/:courseId/announcements
// @access  Private (Instructor, Admin)
export const createAnnouncement = async (req, res) => {
  try {
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
        message: `User ${req.user.id} is not authorized to create announcements for this course`,
      })
    }

    const announcement = await Announcement.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
      course: req.params.courseId,
    })

    res.status(201).json({
      success: true,
      data: announcement,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Instructor, Admin)
export const updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      })
    }

    // Check if user is announcement author or admin
    if (announcement.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this announcement`,
      })
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: announcement,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Instructor, Admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      })
    }

    // Check if user is announcement author or admin
    if (announcement.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this announcement`,
      })
    }

    await announcement.remove()

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

