"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import { useAuth } from "../../context/AuthContext"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    inProgressCourses: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }

      // Get user data with enrolled courses
      const userResponse = await api.get("/auth/me", config)

      // Get certificates
      const certificatesResponse = await api.get("/certificates", config)

      // Get progress for each enrolled course
      const enrolledCourses = userResponse.data.data.user.enrolledCourses
      const inProgressCourses = []

      for (const enrollment of enrolledCourses) {
        const courseId = enrollment.course

        // Get course details
        const courseResponse = await api.get(`/courses/${courseId}`, config)

        // Get progress
        const progressResponse = await api.get(`/progress/${courseId}`, config)

        inProgressCourses.push({
          ...courseResponse.data.data,
          progress: progressResponse.data.data.overallProgress,
        })
      }

      // Sort by progress (highest first)
      inProgressCourses.sort((a, b) => b.progress - a.progress)

      setStats({
        enrolledCourses: enrolledCourses.length,
        completedCourses: certificatesResponse.data.count,
        certificates: certificatesResponse.data.count,
        inProgressCourses: inProgressCourses.slice(0, 3), // Show only 3 most progressed courses
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-gray-600">Here's an overview of your learning progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Enrolled Courses</h3>
            <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
              <i className="fas fa-book-open text-accent text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-accent">{stats.enrolledCourses}</p>
          <Link to="/dashboard/enrolled-courses" className="text-sm text-accent hover:underline mt-2 inline-block">
            View all courses
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Completed Courses</h3>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
          <span className="text-sm text-gray-500 mt-2 inline-block">
            {stats.completedCourses > 0 ? "Great job!" : "Keep learning!"}
          </span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Certificates Earned</h3>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-certificate text-yellow-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.certificates}</p>
          <Link to="/dashboard/certificates" className="text-sm text-accent hover:underline mt-2 inline-block">
            View certificates
          </Link>
        </div>
      </div>

      {/* In Progress Courses */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Continue Learning</h2>
          <Link to="/dashboard/enrolled-courses" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>

        {stats.inProgressCourses.length > 0 ? (
          <div className="space-y-6">
            {stats.inProgressCourses.map((course) => (
              <div key={course._id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-b-0 last:pb-0">
                <img
                  src={course.thumbnail || "/placeholder.svg?height=120&width=200"}
                  alt={course.title}
                  className="w-full md:w-48 h-32 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-accent rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{course.progress}% complete</p>
                    </div>
                    <Link
                      to={`/dashboard/course/${course._id}`}
                      className="px-4 py-2 bg-accent text-white text-sm rounded-md hover:bg-accent-dark transition-colors"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You haven't started any courses yet.</p>
            <Link
              to="/courses"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Courses */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Recommended For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* This would typically be populated with recommended courses based on user's interests */}
          <div className="border rounded-lg overflow-hidden">
            <img src="/placeholder.svg?height=150&width=300" alt="Course" className="w-full h-36 object-cover" />
            <div className="p-4">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-accent rounded-full mb-2">
                Technology
              </span>
              <h3 className="font-semibold mb-2">Introduction to Web Development</h3>
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <i className="fas fa-star text-yellow-400 mr-1"></i>
                  4.8
                </span>
                <span className="mx-2">•</span>
                <span>Beginner</span>
              </div>
              <Link
                to="/courses"
                className="block w-full text-center px-3 py-2 bg-accent text-white text-sm rounded-md hover:bg-accent-dark transition-colors"
              >
                View Course
              </Link>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <img src="/placeholder.svg?height=150&width=300" alt="Course" className="w-full h-36 object-cover" />
            <div className="p-4">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-accent rounded-full mb-2">
                Business
              </span>
              <h3 className="font-semibold mb-2">Digital Marketing Fundamentals</h3>
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <i className="fas fa-star text-yellow-400 mr-1"></i>
                  4.6
                </span>
                <span className="mx-2">•</span>
                <span>Intermediate</span>
              </div>
              <Link
                to="/courses"
                className="block w-full text-center px-3 py-2 bg-accent text-white text-sm rounded-md hover:bg-accent-dark transition-colors"
              >
                View Course
              </Link>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <img src="/placeholder.svg?height=150&width=300" alt="Course" className="w-full h-36 object-cover" />
            <div className="p-4">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-accent rounded-full mb-2">
                Design
              </span>
              <h3 className="font-semibold mb-2">UI/UX Design Principles</h3>
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <i className="fas fa-star text-yellow-400 mr-1"></i>
                  4.7
                </span>
                <span className="mx-2">•</span>
                <span>Advanced</span>
              </div>
              <Link
                to="/courses"
                className="block w-full text-center px-3 py-2 bg-accent text-white text-sm rounded-md hover:bg-accent-dark transition-colors"
              >
                View Course
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

