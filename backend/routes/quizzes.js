import express from "express"
import {
  createQuiz,
  getCourseQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
} from "../controllers/quizzes.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router.route("/").post(protect, authorize("instructor", "admin"), createQuiz)

router.route("/course/:courseId").get(protect, getCourseQuizzes)

router
  .route("/:id")
  .get(protect, getQuiz)
  .put(protect, authorize("instructor", "admin"), updateQuiz)
  .delete(protect, authorize("instructor", "admin"), deleteQuiz)

router.route("/:id/submit").post(protect, submitQuiz)

export default router 