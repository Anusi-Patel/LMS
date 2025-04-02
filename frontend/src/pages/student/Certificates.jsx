"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"
import { toast } from "react-hot-toast"

const Certificates = () => {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState(null)

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/student/certificates`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        )
        setCertificates(response.data)
      } catch (error) {
        console.error("Error fetching certificates:", error)
        toast.error("Failed to load certificates")
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const fetchCertificateDetails = async (certificateId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/certificates/${certificateId}`, config)

      setSelectedCertificate(response.data.data)
    } catch (error) {
      console.error("Error fetching certificate details:", error)
      toast.error("Failed to load certificate details")
    }
  }

  const downloadCertificate = () => {
    // In a real application, this would generate and download a PDF
    toast.success("Certificate download started")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Certificates</h1>
        <p className="text-gray-600">View and download your earned certificates</p>
      </div>

      {selectedCertificate ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="flex items-center text-accent hover:underline mb-6"
            >
              <i className="fas fa-arrow-left mr-1"></i>
              Back to certificates
            </button>

            <div className="border rounded-lg p-8 mb-6 bg-primary/10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-accent mb-2">Certificate of Completion</h2>
                <p className="text-lg">This certifies that</p>
                <p className="text-2xl font-semibold my-4">{selectedCertificate.user.name}</p>
                <p className="text-lg">has successfully completed the course</p>
                <p className="text-2xl font-semibold my-4">{selectedCertificate.course.title}</p>
                <p className="text-lg mb-6">on {new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>

                <div className="flex justify-center mb-4">
                  <div className="border-b-2 border-gray-400 w-48"></div>
                </div>
                <p className="text-lg font-medium">{selectedCertificate.course.instructor.name}</p>
                <p className="text-sm text-gray-600">Instructor</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Certificate ID: {selectedCertificate.certificateId}</p>
                <p className="text-sm text-gray-600">
                  Verify at: {window.location.origin}/verify-certificate/{selectedCertificate.certificateId}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={downloadCertificate}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
              >
                <i className="fas fa-download mr-2"></i>
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {certificates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div
                  key={certificate._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center">
                        <i className="fas fa-certificate text-accent text-2xl"></i>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-center mb-2">{certificate.courseTitle}</h3>
                    <p className="text-gray-500 text-sm text-center mb-4">
                      Issued on {new Date(certificate.issuedDate).toLocaleDateString()}
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => fetchCertificateDetails(certificate._id)}
                        className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
                      >
                        View Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-certificate text-gray-400 text-2xl"></i>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete courses to earn certificates and showcase your achievements.
              </p>
              <a
                href="/dashboard/enrolled-courses"
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
              >
                Go to My Courses
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Certificates

