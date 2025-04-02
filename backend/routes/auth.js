import express from "express"
import { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  updateProfilePicture,
  forgotPassword,
  resetPassword 
} from "../controllers/auth.js"
import { protect } from "../middleware/auth.js"
import multer from "multer"
import path from "path"
import fs from "fs"

const router = express.Router()

// Ensure uploads directory exists
const uploadDir = "uploads/profile-pictures"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    cb(null, `user-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB.",
      })
    }
  }
  next(err)
}

// Public routes
router.post("/register", register)
router.post("/login", login)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:resettoken", resetPassword)

// Protected routes
router.get("/me", protect, getMe)
router.put("/updateprofile", protect, updateProfile)
router.put(
  "/updateprofilepicture",
  protect,
  upload.single("profilePicture"),
  handleMulterError,
  updateProfilePicture
)

export default router

