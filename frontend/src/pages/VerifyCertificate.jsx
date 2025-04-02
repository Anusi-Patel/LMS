"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"

const VerifyCertificate = () => {
  const { certificateId } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (certificateId) {
      verifyCertificate()
    }
  }, [certificateId])

  const verifyCertificate = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/certificates/verify/${certificateId}`)

      if (response.data.success) {
        setCertificate(response.data.data.certificate)
      } else {
        setError("Invalid certificate ID")
      }

      setLoading(false)
    } catch (error) {
      console.error("Error verifying certificate:", error)
      setError("Failed to verify certificate")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary/5 py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <h1 className="text-2xl font-bold mb-6 text-center">Certificate Verification</h1>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-times text-red-500 text-2xl"></i>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <div className="flex justify-center">
                    <Link to="/" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark">
                      Return to Home
                    </Link>
                  </div>
                </div>
              ) : certificate ? (
                <div>
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-green-500 text-2xl"></i>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-center mb-6">Certificate Verified</h2>

                  <div className="border rounded-lg p-6 bg-primary/10 mb-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Certificate ID</p>
                          <p className="font-medium">{certificate.certificateId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Issue Date</p>
                          <p className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Recipient</p>
                        <p className="font-medium">{certificate.user.name}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Course</p>
                        <p className="font-medium">{certificate.course.title}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Instructor</p>
                        <p className="font-medium">{certificate.course.instructor.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 mb-6">
                      This certificate confirms that the recipient has successfully completed the course.
                    </p>
                    <Link to="/" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark">
                      Return to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-4">Verify a Certificate</h2>
                  <p className="text-gray-600 mb-6">Enter a certificate ID to verify its authenticity.</p>
                  <div className="max-w-md mx-auto">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Certificate ID (e.g., CERT-1234ABCD)"
                        className="flex-1 border rounded-l-md px-4 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                        value={certificateId || ""}
                        onChange={(e) => setCertificate(e.target.value)}
                      />
                      <button
                        onClick={verifyCertificate}
                        className="bg-accent text-white px-4 py-2 rounded-r-md hover:bg-accent-dark"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyCertificate

