import express from "express"
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  enrollCourse,
  rateCourse,
} from "../controllers/courses.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router.route("/").get(getCourses).post(protect, authorize("instructor", "admin"), createCourse)

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("instructor", "admin"), updateCourse)
  .delete(protect, authorize("instructor", "admin"), deleteCourse)

router.route("/:id/lessons").post(protect, authorize("instructor", "admin"), addLesson)

router.route("/:id/enroll").post(protect, authorize("student"), enrollCourse)

router.route("/:id/ratings").post(protect, rateCourse)

export default router

