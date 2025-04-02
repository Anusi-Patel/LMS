import mongoose from "mongoose"

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  content: {
    type: String,
    required: [true, "Please add content"],
  },
  contentType: {
    type: String,
    enum: ["video", "pdf", "text"],
    required: [true, "Please specify content type"],
  },
  videoUrl: {
    type: String,
  },
  pdfUrl: {
    type: String,
  },
  duration: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    required: [true, "Please add an order number"],
  },
})

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  questions: [
    {
      question: {
        type: String,
        required: [true, "Please add a question"],
      },
      options: [
        {
          text: {
            type: String,
            required: [true, "Please add an option"],
          },
          isCorrect: {
            type: Boolean,
            default: false,
          },
        },
      ],
      type: {
        type: String,
        enum: ["multiple-choice", "true-false", "open-ended"],
        default: "multiple-choice",
      },
    },
  ],
  passingScore: {
    type: Number,
    default: 70,
  },
  order: {
    type: Number,
    required: [true, "Please add an order number"],
  },
})

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  dueDate: {
    type: Date,
  },
  maxScore: {
    type: Number,
    default: 100,
  },
  order: {
    type: Number,
    required: [true, "Please add an order number"],
  },
})

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: ["Business", "Technology", "Design", "Marketing", "Other"],
  },
  tags: [String],
  thumbnail: {
    type: String,
    default: "no-photo.jpg",
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lessons: [LessonSchema],
  quizzes: [QuizSchema],
  assignments: [AssignmentSchema],
  price: {
    type: Number,
    default: 0,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  enrollments: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      enrollmentDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  ratings: [
    {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      review: {
        type: String,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  averageRating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot be more than 5"],
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create course slug from the title
CourseSchema.pre("save", function (next) {
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
  next()
})

// Calculate average rating
CourseSchema.methods.getAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0
  } else {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0)
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10
  }
  this.save()
}

const Course = mongoose.model("Course", CourseSchema)

export default Course

