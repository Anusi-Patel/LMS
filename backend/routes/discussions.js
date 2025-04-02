import express from "express"
import {
  createDiscussion,
  getCourseDiscussions,
  getDiscussion,
  addReply,
  resolveDiscussion,
  upvoteDiscussion,
} from "../controllers/discussions.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router
  .route("/course/:courseId")
  .get(getCourseDiscussions)
  .post(createDiscussion)

router
  .route("/:id")
  .get(getDiscussion)

router
  .route("/:id/replies")
  .post(addReply)

router
  .route("/:id/resolve")
  .put(authorize("instructor", "admin"), resolveDiscussion)

router
  .route("/:id/upvote")
  .put(upvoteDiscussion)

export default router

