import mongoose from "mongoose"

const DiscussionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please provide a discussion title"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Please provide discussion content"],
  },
  replies: [
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      isInstructor: {
        type: Boolean,
        default: false,
      },
    },
  ],
  isResolved: {
    type: Boolean,
    default: false,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Discussion = mongoose.model("Discussion", DiscussionSchema)

export default Discussion

