"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import { useAuth } from "../../context/AuthContext"
import { toast } from "sonner"
import { getCourseThumbnailUrl } from "../../utils/imageUtils"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    recentCourses: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Get instructor courses
      const response = await api.get(`/courses?instructor=${user._id}`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch courses")
      }

      const courses = response.data.data

      // Calculate total students and revenue
      let totalStudents = 0
      let totalRevenue = 0

      courses.forEach((course) => {
        totalStudents += course.enrollments?.length || 0
        totalRevenue += (course.enrollments?.length || 0) * (course.price || 0)
      })

      setStats({
        totalCourses: courses.length,
        totalStudents,
        totalRevenue,
        recentCourses: courses.slice(0, 3), // Show only 3 most recent courses
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error(error.response?.data?.message || "Failed to load dashboard data")
      setLoading(false)
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Instructor Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Total Courses</h3>
            <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
              <i className="fas fa-book-open text-accent text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-accent">{stats.totalCourses}</p>
          <Link to="/instructor/courses" className="text-sm text-accent hover:underline mt-2 inline-block">
            View all courses
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Total Students</h3>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
          <span className="text-sm text-gray-500 mt-2 inline-block">Across all courses</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
          <span className="text-sm text-gray-500 mt-2 inline-block">From course enrollments</span>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Courses</h2>
          <Link to="/instructor/courses" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>

        {stats.recentCourses.length > 0 ? (
          <div className="space-y-6">
            {stats.recentCourses.map((course) => (
              <div key={course._id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-b-0 last:pb-0">
                <img
                  src={getCourseThumbnailUrl(course.thumbnail)}
                  alt={course.title}
                  className="w-full md:w-48 h-32 object-cover rounded-md"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-accent rounded-full">
                      {course.category}
                    </span>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <i className="fas fa-users mr-1"></i>
                      <span>{course.enrollments.length} students</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span>{course.averageRating || "No ratings"}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-dollar-sign mr-1"></i>
                      <span>{course.isPaid ? `$${course.price}` : "Free"}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/instructor/courses/edit/${course._id}`}
                      className="px-3 py-1 bg-accent text-white text-sm rounded-md hover:bg-accent-dark transition-colors"
                    >
                      Edit Course
                    </Link>
                    <Link
                      to={`/instructor/courses/${course._id}/students`}
                      className="px-3 py-1 bg-white border border-accent text-accent text-sm rounded-md hover:bg-accent hover:text-white transition-colors"
                    >
                      View Students
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You haven't created any courses yet.</p>
            <Link
              to="/instructor/courses/create"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
            >
              Create Your First Course
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/instructor/courses/create"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center mb-3">
              <i className="fas fa-plus text-accent text-xl"></i>
            </div>
            <h3 className="font-medium text-center">Create New Course</h3>
          </Link>

          <Link
            to="/instructor/courses"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <i className="fas fa-edit text-blue-600 text-xl"></i>
            </div>
            <h3 className="font-medium text-center">Manage Courses</h3>
          </Link>

          <Link
            to="/dashboard/profile"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <i className="fas fa-user-cog text-purple-600 text-xl"></i>
            </div>
            <h3 className="font-medium text-center">Update Profile</h3>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

