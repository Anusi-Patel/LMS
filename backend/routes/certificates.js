import express from "express"
import { getCertificates, getCertificate, verifyCertificate } from "../controllers/certificates.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.route("/").get(protect, getCertificates)

router.route("/:id").get(protect, getCertificate)

router.route("/verify/:certificateId").get(verifyCertificate)

export default router

