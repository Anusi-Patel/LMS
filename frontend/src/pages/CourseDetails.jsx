"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import { toast } from "sonner"
import { getCourseThumbnailUrl, getProfilePictureUrl } from "../utils/imageUtils"

const CourseDetails = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await api.get(`/courses/${courseId}`)
        
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to fetch course details")
        }

        const courseData = response.data.data
        setCourse(courseData)

        // Check if user is enrolled
        if (user && courseData.enrollments) {
          const isUserEnrolled = courseData.enrollments.some(
            (enrollment) => enrollment.student?._id === user._id
          )
          setIsEnrolled(isUserEnrolled)
        }
      } catch (error) {
        console.error("Error fetching course details:", error)
        toast.error(error.response?.data?.message || "Failed to load course details")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [courseId, user])

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll in this course")
      navigate("/login")
      return
    }

    try {
      setEnrolling(true)

      const response = await api.post(`/courses/${courseId}/enroll`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to enroll in course")
      }

      toast.success("Successfully enrolled in the course")
      setIsEnrolled(true)
      setEnrolling(false)
    } catch (error) {
      console.error("Error enrolling in course:", error)
      toast.error(error.response?.data?.message || "Failed to enroll in course")
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Link to="/courses" className="text-accent hover:underline">
          Browse all courses
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-primary/5 min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative">
            <img
              src={getCourseThumbnailUrl(course?.thumbnail)}
              alt={course?.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
              <div className="p-6 text-white">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary text-accent rounded-full">
                    {course.category}
                  </span>
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 text-white rounded-full">
                    {course.difficulty}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center text-sm">
                  <span className="flex items-center mr-4">
                    <i className="fas fa-star text-yellow-400 mr-1"></i>
                    {course.averageRating ? course.averageRating.toFixed(1) : "N/A"}
                    <span className="ml-1">({course.ratings?.length || 0} ratings)</span>
                  </span>
                  <span className="flex items-center mr-4">
                    <i className="fas fa-users mr-1"></i>
                    {course.enrollments?.length || 0} students
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-clock mr-1"></i>
                    {course.lessons?.reduce((total, lesson) => total + (lesson?.duration || 0), 0) || 0} mins
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <p className="text-gray-700 mb-6">{course.description}</p>

              <h3 className="text-xl font-semibold mb-3">What You'll Learn</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                {course.lessons?.slice(0, 6).map((lesson, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span>{lesson?.title}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold mb-3">Course Content</h3>
              <div className="border rounded-md overflow-hidden mb-6">
                <div className="bg-gray-100 p-4 border-b">
                  <span className="font-medium">{course.lessons?.length || 0} lessons</span>
                  <span className="mx-2">•</span>
                  <span>{course.lessons?.reduce((total, lesson) => total + (lesson?.duration || 0), 0) || 0} total mins</span>
                </div>
                <div className="divide-y">
                  {course.lessons?.slice(0, 5).map((lesson, index) => (
                    <div key={index} className="p-4 flex justify-between items-center">
                      <div className="flex items-start">
                        <i className="fas fa-play-circle text-accent mt-1 mr-3"></i>
                        <div>
                          <h4 className="font-medium">{lesson?.title}</h4>
                          <p className="text-sm text-gray-600">{lesson?.description}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{lesson?.duration || 0} mins</span>
                    </div>
                  ))}
                  {course.lessons?.length > 5 && (
                    <div className="p-4 text-center text-accent font-medium">
                      {course.lessons.length - 5} more lessons
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">Instructor</h3>
              <div className="flex items-start mb-6">
                <img
                  src={getProfilePictureUrl(course?.instructor?.profilePicture)}
                  alt={course?.instructor?.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-lg">{course?.instructor?.name}</h4>
                  <p className="text-gray-600">Instructor</p>
                </div>
              </div>
            </div>

            <div className="md:w-1/3">
              <div className="bg-white border rounded-lg shadow-sm p-6 sticky top-24">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-accent">
                    {course.isPaid ? `$${course.price?.toFixed(2) || "0.00"}` : "Free"}
                  </span>
                </div>

                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center">
                      <i className="fas fa-check-circle mr-2"></i>
                      <span>You are enrolled in this course</span>
                    </div>
                    <Link
                      to={`/dashboard/course/${course._id}`}
                      className="block w-full text-center px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors"
                    >
                      Go to Course
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors disabled:bg-gray-400"
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </button>
                )}

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center">
                    <i className="fas fa-certificate text-accent mr-3"></i>
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-infinity text-accent mr-3"></i>
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-mobile-alt text-accent mr-3"></i>
                    <span>Access on mobile and desktop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>

          {course?.ratings?.length > 0 ? (
            <div className="space-y-6">
              {course.ratings.map((rating, index) => (
                <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start">
                    <img 
                      src={getProfilePictureUrl(rating.student?.profilePicture)}
                      alt={rating.student?.name || "Student"} 
                      className="w-10 h-10 rounded-full mr-4" 
                    />
                    <div>
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium mr-2">{rating.student?.name || "Anonymous"}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${i < rating.rating ? "text-yellow-400" : "text-gray-300"}`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{rating.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseDetails

