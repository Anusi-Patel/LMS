"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"
import CourseNavigation from "../../components/CourseNavigation"

const InstructorDiscussions = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  useEffect(() => {
    fetchDiscussions()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post(`/discussions/course/${courseId}`, formData)
      if (response.data.success) {
        toast.success("Discussion created successfully")
        setShowForm(false)
        setFormData({ title: "", content: "" })
        fetchDiscussions()
      }
    } catch (error) {
      console.error("Error creating discussion:", error)
      toast.error("Failed to create discussion")
    }
  }

  const handleResolve = async (discussionId) => {
    try {
      const response = await api.put(`/discussions/${discussionId}/resolve`)
      if (response.data.success) {
        toast.success("Discussion marked as resolved")
        fetchDiscussions()
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Course Discussions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
        >
          {showForm ? "Cancel" : "Start Discussion"}
        </button>
      </div>

      <CourseNavigation courseId={courseId} />

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
            >
              Post Discussion
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {discussions.length > 0 ? (
          discussions.map((discussion) => (
            <div key={discussion._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">{discussion.title}</h2>
                    {discussion.isResolved && (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        Resolved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>Posted by {discussion.author.name}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>{discussion.replies.length} replies</span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
                  </div>
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => navigate(`/instructor/courses/${courseId}/discussions/${discussion._id}`)}
                      className="text-accent hover:text-accent-dark"
                    >
                      View Replies
                    </button>
                    {!discussion.isResolved && (
                      <button
                        onClick={() => handleResolve(discussion._id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No discussions yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InstructorDiscussions 