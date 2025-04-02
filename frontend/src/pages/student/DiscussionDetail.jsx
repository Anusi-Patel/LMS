import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"
import { useAuth } from "../../context/AuthContext"

const DiscussionDetail = () => {
  const { courseId, discussionId } = useParams()
  const { user } = useAuth()
  const [discussion, setDiscussion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newReply, setNewReply] = useState("")
  const [isInstructor, setIsInstructor] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    fetchDiscussion()
    checkUserStatus()
  }, [discussionId, courseId])

  const fetchDiscussion = async () => {
    try {
      const response = await api.get(`/discussions/${discussionId}`)
      if (response.data.success) {
        setDiscussion(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching discussion:", error)
      toast.error("Failed to load discussion")
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

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!isEnrolled && !isInstructor) {
      return toast.error("You must be enrolled in this course to reply to discussions")
    }
    if (!newReply.trim()) {
      return toast.error("Please enter a reply")
    }

    try {
      const response = await api.post(`/discussions/${discussionId}/replies`, {
        content: newReply,
      })

      if (response.data.success) {
        setDiscussion(response.data.data)
        setNewReply("")
        toast.success("Reply added successfully")
      }
    } catch (error) {
      console.error("Error adding reply:", error)
      toast.error(error.response?.data?.message || "Failed to add reply")
    }
  }

  const handleUpvote = async () => {
    try {
      const response = await api.put(`/discussions/${discussionId}/upvote`)
      if (response.data.success) {
        setDiscussion(response.data.data)
      }
    } catch (error) {
      console.error("Error upvoting discussion:", error)
      toast.error("Failed to upvote discussion")
    }
  }

  const handleResolve = async () => {
    try {
      const response = await api.put(`/discussions/${discussionId}/resolve`)
      if (response.data.success) {
        setDiscussion(response.data.data)
        toast.success("Discussion marked as resolved")
      }
    } catch (error) {
      console.error("Error resolving discussion:", error)
      toast.error("Failed to resolve discussion")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Discussion not found</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            to={`/dashboard/course/${courseId}/discussions`}
            className="text-accent hover:text-accent-dark mb-4 inline-block"
          >
            ← Back to Discussions
          </Link>
          <h1 className="text-2xl font-bold mb-2">{discussion.title}</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span>Posted by {discussion.author.name}</span>
            <span className="mx-2">•</span>
            <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
              discussion.upvotes.includes(user._id)
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className="fas fa-arrow-up"></i>
            <span>{discussion.upvotes.length}</span>
          </button>
          {isInstructor && !discussion.isResolved && (
            <button
              onClick={handleResolve}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
            >
              Mark as Resolved
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
      </div>

      {/* Replies Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Replies ({discussion.replies.length})</h2>
        {discussion.replies.map((reply) => (
          <div key={reply._id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="font-medium">{reply.author.name}</span>
                  {reply.isInstructor && (
                    <span className="ml-2 px-2 py-1 bg-accent text-white text-xs rounded-full">
                      Instructor
                    </span>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      {(isEnrolled || isInstructor) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Add a Reply</h2>
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <div>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows="4"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="Write your reply..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              Post Reply
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default DiscussionDetail 