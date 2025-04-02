"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"
import { useAuth } from "../../context/AuthContext"
import { getCourseThumbnailUrl } from "../../utils/imageUtils"

const ManageCourses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all") // 'all', 'published', 'draft'
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [user])

  const fetchCourses = async () => {
    try {
      setLoading(true)

      const response = await api.get(`/courses?instructor=${user._id}`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch courses")
      }

      setCourses(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error(error.response?.data?.message || "Failed to load courses")
      setLoading(false)
    }
  }

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      const response = await api.put(`/courses/${courseId}`, { isPublished: !currentStatus })
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update course status")
      }

      // Update local state
      setCourses(
        courses.map((course) => (course._id === courseId ? { ...course, isPublished: !currentStatus } : course)),
      )

      toast.success(`Course ${!currentStatus ? "published" : "unpublished"} successfully`)
    } catch (error) {
      console.error("Error toggling publish status:", error)
      toast.error(error.response?.data?.message || "Failed to update course status")
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      const response = await api.delete(`/courses/${courseId}`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete course")
      }

      // Update local state
      setCourses(courses.filter((course) => course._id !== courseId))

      toast.success("Course deleted successfully")
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error(error.response?.data?.message || "Failed to delete course")
    }
  }

  const filteredCourses = () => {
    let filtered = courses

    // Filter by tab
    if (activeTab === "published") {
      filtered = filtered.filter((course) => course.isPublished)
    } else if (activeTab === "draft") {
      filtered = filtered.filter((course) => !course.isPublished)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Manage Courses</h1>
          <p className="text-gray-600">Create, edit, and manage your courses</p>
        </div>
        <Link
          to="/instructor/courses/create"
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Create New Course
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
            />
          </div>
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-l-md ${
                activeTab === "all" ? "bg-accent text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`px-4 py-2 ${
                activeTab === "published" ? "bg-accent text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab("draft")}
              className={`px-4 py-2 rounded-r-md ${
                activeTab === "draft" ? "bg-accent text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Draft
            </button>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses().length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "No courses match your search criteria."
              : activeTab === "all"
                ? "You haven't created any courses yet."
                : activeTab === "published"
                  ? "You don't have any published courses."
                  : "You don't have any draft courses."}
          </p>
          {!searchTerm && activeTab === "all" && (
            <Link
              to="/instructor/courses/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark"
            >
              Create Your First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Course
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Students
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rating
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses().map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={getCourseThumbnailUrl(course.thumbnail)}
                            alt={course.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.enrollments.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.averageRating ? (
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">
                            <i className="fas fa-star"></i>
                          </span>
                          {course.averageRating.toFixed(1)}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.isPaid ? `$${course.price.toFixed(2)}` : "Free"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/instructor/courses/edit/${course._id}`}
                          className="text-accent hover:text-accent-dark"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => handlePublishToggle(course._id, course.isPublished)}
                          className={
                            course.isPublished
                              ? "text-yellow-600 hover:text-yellow-800"
                              : "text-green-600 hover:text-green-800"
                          }
                        >
                          <i className={`fas ${course.isPublished ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                        <Link
                          to={`/instructor/courses/${course._id}/students`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <i className="fas fa-users"></i>
                        </Link>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageCourses

