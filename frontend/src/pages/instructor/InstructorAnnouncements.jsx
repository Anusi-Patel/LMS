"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"
import CourseNavigation from "../../components/CourseNavigation"

const InstructorAnnouncements = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [courseId])

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get(`/announcements/course/${courseId}`)
      if (response.data.success) {
        setAnnouncements(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
      toast.error("Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post(`/announcements/course/${courseId}`, formData)
      if (response.data.success) {
        toast.success("Announcement created successfully")
        setShowForm(false)
        setFormData({ title: "", content: "" })
        fetchAnnouncements()
      }
    } catch (error) {
      console.error("Error creating announcement:", error)
      toast.error("Failed to create announcement")
    }
  }

  const handleDelete = async (announcementId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return

    try {
      const response = await api.delete(`/announcements/${announcementId}`)
      if (response.data.success) {
        toast.success("Announcement deleted successfully")
        fetchAnnouncements()
      }
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast.error("Failed to delete announcement")
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
        <h1 className="text-3xl font-bold">Course Announcements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
        >
          {showForm ? "Cancel" : "Create Announcement"}
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
              Post Announcement
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{announcement.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>Posted by {announcement.author.name}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(announcement._id)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No announcements yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InstructorAnnouncements 