import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"
import CourseNavigation from "../../components/CourseNavigation"

const Announcements = () => {
  const { courseId } = useParams()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

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
      </div>

      <CourseNavigation courseId={courseId} />

      <div className="space-y-6">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-4">
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

export default Announcements 