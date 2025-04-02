"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import { toast } from "sonner"
import CourseNavigation from "../../components/CourseNavigation"
import CourseDiscussions from "../../components/CourseDiscussions"

const CourseContent = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)

      // Get course details
      const courseResponse = await api.get(`/courses/${courseId}`)
      // Get progress
      const progressResponse = await api.get(`/progress/${courseId}`)

      setCourse(courseResponse.data.data)
      setProgress(progressResponse.data.data)

      // Set active lesson to first incomplete lesson or first lesson
      const lessons = courseResponse.data.data.lessons
      const progressLessons = progressResponse.data.data.lessons

      if (lessons.length > 0) {
        const incompleteLesson = progressLessons.find((lessonProgress) => !lessonProgress.completed)

        if (incompleteLesson) {
          const lesson = lessons.find((l) => l._id.toString() === incompleteLesson.lesson.toString())
          setActiveLesson(lesson)
        } else {
          setActiveLesson(lessons[0])
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching course data:", error)
      if (error.response?.status === 403) {
        toast.error("You must be enrolled in this course to view progress")
        navigate('/dashboard')
      } else if (error.response?.status === 404) {
        toast.error("Course not found")
        navigate('/dashboard')
      } else {
        toast.error("Failed to load course data")
      }
      setLoading(false)
    }
  }

  const markLessonComplete = async (lessonId) => {
    try {
      const response = await api.put(`/progress/${courseId}/lessons/${lessonId}`, {
        completed: true,
        timeSpent: 0 // Add a default time spent
      })

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update progress")
      }

      // Update progress state
      setProgress((prevProgress) => {
        if (!prevProgress) return null
        
        const updatedLessons = prevProgress.lessons.map((lesson) => {
          if (lesson.lesson.toString() === lessonId) {
            return { ...lesson, completed: true, completedAt: Date.now() }
          }
          return lesson
        })

        return {
          ...prevProgress,
          lessons: updatedLessons,
        }
      })

      toast.success("Lesson marked as complete")
    } catch (error) {
      console.error("Error marking lesson as complete:", error)
      toast.error(error.response?.data?.message || "Failed to update progress")
    }
  }

  const isLessonCompleted = (lessonId) => {
    return progress?.lessons.some(
      (lessonProgress) =>
        lessonProgress.lesson === lessonId && lessonProgress.completed
    )
  }

  const calculateOverallProgress = () => {
    if (!progress || !course) return 0
    const completedLessons = progress.lessons.filter((lesson) => lesson.completed).length
    return Math.round((completedLessons / course.lessons.length) * 100)
  }

  // Add this function to convert YouTube URLs to embed URLs
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return ""
    
    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    
    return url
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Course not found</h2>
          <p className="text-gray-600 mt-2">The course you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <div className="text-sm text-gray-600">
          Progress: {calculateOverallProgress()}%
        </div>
      </div>

      <CourseNavigation courseId={courseId} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Course Content Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Course Content</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson) => (
                <button
                  key={lesson._id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    activeLesson?._id === lesson._id
                      ? "bg-accent text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{lesson.title}</span>
                    {isLessonCompleted(lesson._id) && (
                      <i className="fas fa-check text-green-500"></i>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-8">
          {/* Lesson Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeLesson ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">{activeLesson.title}</h2>
                {activeLesson.contentType === "video" ? (
                  <div className="relative w-full" style={{ paddingTop: '56.25%', minHeight: '400px' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                      title={activeLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      onError={(e) => {
                        console.error("Error loading video:", e)
                        toast.error("Failed to load video. Please check the video URL.")
                      }}
                    ></iframe>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    {activeLesson.content}
                  </div>
                )}
                <button
                  onClick={() => markLessonComplete(activeLesson._id)}
                  className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  Mark as Complete
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900">
                  Select a lesson to begin
                </h2>
              </div>
            )}
          </div>

          {/* Course Discussions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <CourseDiscussions courseId={courseId} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseContent

