"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import { toast } from "sonner"
import CourseDiscussions from "../../components/CourseDiscussions"

const CourseContent = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)

      // Get course details
      const courseResponse = await api.get(`/courses/${courseId}`)
      setCourse(courseResponse.data.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching course data:", error)
      toast.error("Failed to load course data")
      setLoading(false)
      navigate("/instructor/courses")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Course not found</h2>
          <p className="text-gray-600 mt-2">The course you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/instructor/courses')}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
          >
            Return to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/instructor/courses/edit/${courseId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Course
          </button>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}/students`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            View Students
          </button>
          <button
            onClick={() => navigate("/instructor/courses")}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Courses
          </button>
        </div>
      </div>

      {/* Course Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={course.thumbnail || "/placeholder.svg?height=150&width=250"}
            alt={course.title}
            className="w-full md:w-64 h-40 object-cover rounded-md"
          />
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-accent rounded-full">
                {course.category}
              </span>
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                {course.difficulty}
              </span>
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  course.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {course.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <i className="fas fa-users mr-1"></i>
                <span>{course.enrollments.length} students</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-book mr-1"></i>
                <span>{course.lessons.length} lessons</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-dollar-sign mr-1"></i>
                <span>{course.isPaid ? `$${course.price}` : "Free"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Discussions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <CourseDiscussions courseId={courseId} />
      </div>
    </div>
  )
}

export default CourseContent 