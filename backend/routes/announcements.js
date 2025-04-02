import express from "express"
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcements.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router
  .route("/:id")
  .put(protect, authorize("instructor", "admin"), updateAnnouncement)
  .delete(protect, authorize("instructor", "admin"), deleteAnnouncement)

// Course specific announcements
router
  .route("/course/:courseId")
  .get(protect, getAnnouncements)
  .post(protect, authorize("instructor", "admin"), createAnnouncement)

export default router

