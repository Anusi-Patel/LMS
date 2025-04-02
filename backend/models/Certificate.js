import mongoose from "mongoose"
import crypto from "crypto"

const CertificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  certificateId: {
    type: String,
    unique: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  completionDate: {
    type: Date,
    default: Date.now,
  },
})

// Generate unique certificate ID
CertificateSchema.pre("save", function (next) {
  if (!this.certificateId) {
    // Generate a unique certificate ID
    const uniqueId = crypto.randomBytes(8).toString("hex").toUpperCase()
    this.certificateId = `CERT-${uniqueId}`
  }
  next()
})

const Certificate = mongoose.model("Certificate", CertificateSchema)

export default Certificate

