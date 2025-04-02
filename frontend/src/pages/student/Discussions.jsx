import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"
import { useAuth } from "../../context/AuthContext"

const Discussions = () => {
  const { courseId } = useParams()
  const { user } = useAuth()
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
  })
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isInstructor, setIsInstructor] = useState(false)

  useEffect(() => {
    fetchDiscussions()
    checkUserStatus()
  }, [courseId])

  const fetchDiscussions = async () => {
    try {
      console.log('Fetching discussions for course:', courseId)
      const token = localStorage.getItem('token')
      console.log('Auth token:', token ? 'Present' : 'Missing')
      
      const response = await api.get(`/discussions/course/${courseId}`)
      console.log('API Response:', response.data)
      
      if (response.data.success) {
        setDiscussions(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching discussions:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isEnrolled) {
      return toast.error("You must be enrolled in this course to create discussions")
    }
    if (!newDiscussion.title || !newDiscussion.content) {
      return toast.error("Please fill in all fields")
    }

    try {
      const response = await api.post(`/discussions/course/${courseId}`, {
        title: newDiscussion.title,
        content: newDiscussion.content,
      })

      if (response.data.success) {
        setDiscussions([response.data.data, ...discussions])
        setNewDiscussion({ title: "", content: "" })
        toast.success("Discussion created successfully")
      }
    } catch (error) {
      console.error("Error creating discussion:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error(error.response?.data?.message || "Failed to create discussion")
    }
  }

  const handleUpvote = async (discussionId) => {
    try {
      const response = await api.put(`/discussions/${discussionId}/upvote`)
      if (response.data.success) {
        setDiscussions(
          discussions.map((discussion) =>
            discussion._id === discussionId ? response.data.data : discussion
          )
        )
      }
    } catch (error) {
      console.error("Error upvoting discussion:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error(error.response?.data?.message || "Failed to upvote discussion")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Course Discussions</h1>
        <p className="text-gray-600">Ask questions and interact with other students</p>
      </div>

      {/* New Discussion Form */}
      {(isEnrolled || isInstructor) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Start a New Discussion</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="Enter a title for your discussion"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                rows="4"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="Describe your question or topic"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              Create Discussion
            </button>
          </form>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <div key={discussion._id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">{discussion.title}</h3>
                <p className="text-gray-600 mb-4">{discussion.content}</p>
                <div className="flex items-center text-sm text-gray-500">
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
              <button
                onClick={() => handleUpvote(discussion._id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                  discussion.upvotes.includes(user._id)
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-arrow-up"></i>
                <span>{discussion.upvotes.length}</span>
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Link
                to={`/dashboard/course/${courseId}/discussions/${discussion._id}`}
                className="text-accent hover:text-accent-dark"
              >
                View {discussion.replies.length} {discussion.replies.length === 1 ? 'reply' : 'replies'} →
              </Link>
              {discussion.isResolved && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Discussions 