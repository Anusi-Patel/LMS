"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"
import CourseNavigation from "../../components/CourseNavigation"

const DiscussionDetail = () => {
  const { courseId, discussionId } = useParams()
  const navigate = useNavigate()
  const [discussion, setDiscussion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    fetchDiscussion()
  }, [discussionId])

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

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post(`/discussions/${discussionId}/replies`, {
        content: replyContent,
      })
      if (response.data.success) {
        toast.success("Reply added successfully")
        setReplyContent("")
        fetchDiscussion()
      }
    } catch (error) {
      console.error("Error adding reply:", error)
      toast.error("Failed to add reply")
    }
  }

  const handleResolve = async () => {
    try {
      const response = await api.put(`/discussions/${discussionId}/resolve`)
      if (response.data.success) {
        toast.success("Discussion marked as resolved")
        fetchDiscussion()
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Discussion not found</h2>
          <p className="text-gray-600 mt-2">The discussion you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}/discussions`)}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
          >
            Back to Discussions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Discussion Details</h1>
        <div className="flex space-x-4">
          {!discussion.isResolved && (
            <button
              onClick={handleResolve}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Mark as Resolved
            </button>
          )}
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}/discussions`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Discussions
          </button>
        </div>
      </div>

      <CourseNavigation courseId={courseId} />

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold">{discussion.title}</h2>
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
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Replies ({discussion.replies.length})</h3>
        <form onSubmit={handleSubmitReply} className="mb-6">
          <div>
            <label htmlFor="reply" className="block text-sm font-medium text-gray-700">
              Add a Reply
            </label>
            <textarea
              id="reply"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
          >
            Post Reply
          </button>
        </form>

        <div className="space-y-6">
          {discussion.replies.length > 0 ? (
            discussion.replies.map((reply) => (
              <div key={reply._id} className="border-t pt-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>Reply by {reply.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No replies yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiscussionDetail 