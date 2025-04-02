import mongoose from "mongoose"

const AnnouncementSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Please add content"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Announcement = mongoose.model("Announcement", AnnouncementSchema)

export default Announcement

