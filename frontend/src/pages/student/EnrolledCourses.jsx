"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"

const EnrolledCourses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all") // 'all', 'inProgress', 'completed'

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/student/enrolled-courses`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        )
        setCourses(response.data)
      } catch (error) {
        console.error("Error fetching enrolled courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [])

  const filteredCourses = () => {
    switch (activeTab) {
      case "inProgress":
        return courses.filter((course) => course.progress < 100)
      case "completed":
        return courses.filter((course) => course.progress === 100)
      default:
        return courses
    }
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
        <h1 className="text-2xl font-bold mb-2">My Courses</h1>
        <p className="text-gray-600">Manage your enrolled courses</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("inProgress")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "inProgress"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            In Progress ({courses.filter((course) => course.progress < 100).length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "completed"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Completed ({courses.filter((course) => course.progress === 100).length})
          </button>
        </nav>
      </div>

      {/* Course List */}
      {filteredCourses().length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-6">
            {activeTab === "all"
              ? "You haven't enrolled in any courses yet."
              : activeTab === "inProgress"
                ? "You don't have any courses in progress."
                : "You haven't completed any courses yet."}
          </p>
          {activeTab === "all" && (
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark"
            >
              Browse Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses().map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4">
                  <img
                    src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
                    alt={course.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-3/4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-accent rounded-full mr-2">
                          {course.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          Enrolled on {new Date(course.enrollmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                      <Link
                        to={`/dashboard/course/${course._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark"
                      >
                        {course.progress === 100 ? "Review Course" : "Continue Learning"}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-accent h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <div className="flex items-center mr-4">
                      <i className="fas fa-book-open mr-1"></i>
                      <span>{course.lessons.length} lessons</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <i className="fas fa-clock mr-1"></i>
                      <span>{course.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)} mins</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-signal mr-1"></i>
                      <span>{course.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EnrolledCourses

