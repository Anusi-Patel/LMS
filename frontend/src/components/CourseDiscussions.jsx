import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../utils/api"
import { toast } from "sonner"
import { useAuth } from "../context/AuthContext"

const CourseDiscussions = ({ courseId }) => {
  const { user } = useAuth()
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isInstructor, setIsInstructor] = useState(false)

  useEffect(() => {
    fetchDiscussions()
    checkUserStatus()
  }, [courseId])

  const fetchDiscussions = async () => {
    try {
      const response = await api.get(`/discussions/course/${courseId}`)
      if (response.data.success) {
        setDiscussions(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching discussions:", error)
      toast.error("Failed to load discussions")
    } finally {
      setLoading(false)
    }
  }

  const checkUserStatus = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`)
      if (response.data.success) {
        const course = response.data.data
        setIsInstructor(course.instructor._id === user._id)
        setIsEnrolled(course.enrollments.some(enrollment => enrollment.student._id === user._id))
      }
    } catch (error) {
      console.error("Error checking user status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Course Discussions</h2>
        {(isEnrolled || isInstructor) && (
          <Link
            to={`/dashboard/course/${courseId}/discussions`}
            className="text-accent hover:text-accent-dark"
          >
            View All Discussions →
          </Link>
        )}
      </div>

      {discussions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No discussions yet</p>
      ) : (
        <div className="space-y-4">
          {discussions.slice(0, 3).map((discussion) => (
            <div key={discussion._id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium mb-1">{discussion.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{discussion.content}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <span>Posted by {discussion.author.name}</span>
                    {discussion.author._id === user._id && (
                      <span className="ml-2 px-2 py-1 bg-accent text-white text-xs rounded-full">
                        You
                      </span>
                    )}
                    <span className="mx-2">•</span>
                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {discussion.replies.length} {discussion.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                  {discussion.isResolved && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseDiscussions 