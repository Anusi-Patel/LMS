"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

const CourseStudents = () => {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCourseAndStudents()
  }, [courseId])

  const fetchCourseAndStudents = async () => {
    try {
      setLoading(true)
      const courseResponse = await api.get(`/courses/${courseId}`)
      setCourse(courseResponse.data.data)

      // Fetch progress for each student
      const studentsWithProgress = await Promise.all(
        courseResponse.data.data.enrollments.map(async (enrollment) => {
          try {
            const progressResponse = await api.get(`/progress/${courseId}`, {
              params: { userId: enrollment.student._id }
            })
            return {
              ...enrollment.student,
              progress: progressResponse.data.data
            }
          } catch (error) {
            console.error(`Error fetching progress for student ${enrollment.student._id}:`, error)
            return {
              ...enrollment.student,
              progress: null
            }
          }
        })
      )

      setStudents(studentsWithProgress)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching course and students:", error)
      toast.error("Failed to load course data")
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <button onClick={() => navigate("/instructor/courses")} className="text-accent hover:underline">
          Back to Courses
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Course Students: {course.title}</h1>
          <p className="text-gray-600">Manage and track student progress</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/instructor/courses/edit/${courseId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Course
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
      <div className="bg-white rounded-lg shadow-sm p-6">
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

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold">Enrolled Students ({students.length})</h2>
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No students enrolled in this course yet.</p>
            <p className="text-sm text-gray-600">Students will appear here once they enroll in your course.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No students match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Enrollment Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Progress
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
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.profilePicture || "/placeholder.svg?height=40&width=40"}
                            alt={student.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                          <div className="bg-accent h-2.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-500">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          // In a real app, this would open a modal with student details
                          toast.success(`Viewing details for ${student.name}`)
                        }}
                        className="text-accent hover:text-accent-dark"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseStudents

