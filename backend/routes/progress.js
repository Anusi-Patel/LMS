import express from "express";
import {
  getProgress,
  updateLessonProgress,
  getLessonProgress,  // ✅ New Controller for fetching lesson progress
  submitQuiz,
  submitAssignment,
  gradeAssignment,
} from "../controllers/progress.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// ✅ Get overall progress for a course
router.route("/:courseId").get(protect, getProgress);

// ✅ Get progress for a specific lesson (NEW)
router.route("/:courseId/lessons/:lessonId").get(protect, getLessonProgress);

// ✅ Update lesson progress
router.route("/:courseId/lessons/:lessonId").put(protect, updateLessonProgress);

// ✅ Submit a quiz attempt
router.route("/:courseId/quizzes/:quizId").post(protect, submitQuiz);

// ✅ Submit an assignment
router.route("/:courseId/assignments/:assignmentId").post(protect, submitAssignment);

// ✅ Grade an assignment (Only Instructors/Admins)
router
  .route("/:courseId/assignments/:assignmentId/grade/:userId")
  .put(protect, authorize("instructor", "admin"), gradeAssignment);

export default router;