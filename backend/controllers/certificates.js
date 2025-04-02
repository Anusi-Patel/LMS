import Certificate from "../models/Certificate.js"

// @desc    Get all certificates for a user
// @route   GET /api/certificates
// @access  Private
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id }).populate({
      path: "course",
      select: "title category",
    })

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Private
export const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate({
        path: "course",
        select: "title category instructor",
        populate: {
          path: "instructor",
          select: "name",
        },
      })
      .populate({
        path: "user",
        select: "name",
      })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      })
    }

    // Check if certificate belongs to user or user is admin
    if (certificate.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this certificate",
      })
    }

    res.status(200).json({
      success: true,
      data: certificate,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
    })
      .populate({
        path: "course",
        select: "title category instructor",
        populate: {
          path: "instructor",
          select: "name",
        },
      })
      .populate({
        path: "user",
        select: "name",
      })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Invalid certificate ID",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        isValid: true,
        certificate,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

