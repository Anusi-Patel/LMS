"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import { toast } from "sonner"

const EditCourse = () => {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [activeTab, setActiveTab] = useState("basic") // 'basic', 'content', 'pricing', 'settings'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    tags: "",
  })

  const [pricingInfo, setPricingInfo] = useState({
    isPaid: false,
    price: 0,
  })

  const [settingsInfo, setSettingsInfo] = useState({
    isPublished: false,
  })

  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)

  // Content states
  const [lessons, setLessons] = useState([])
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    content: "",
    contentType: "text",
    videoUrl: "",
    pdfUrl: "",
    duration: 0,
    order: 0,
  })

  useEffect(() => {
    fetchCourseDetails()
  }, [courseId])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)

      const response = await api.get(`/courses/${courseId}`)

      const courseData = response.data.data
      setCourse(courseData)

      // Set form states
      setBasicInfo({
        title: courseData.title || "",
        description: courseData.description || "",
        category: courseData.category || "Technology",
        difficulty: courseData.difficulty || "Beginner",
        tags: courseData.tags ? courseData.tags.join(", ") : "",
      })

      setPricingInfo({
        isPaid: courseData.isPaid || false,
        price: courseData.price || 0,
      })

      setSettingsInfo({
        isPublished: courseData.isPublished || false,
      })

      setThumbnailPreview(courseData.thumbnail || null)

      // Set lessons
      setLessons(courseData.lessons || [])

      // Set new lesson order
      if (courseData.lessons && courseData.lessons.length > 0) {
        setNewLesson({
          ...newLesson,
          order: courseData.lessons.length,
        })
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching course details:", error)
      toast.error("Failed to load course details")
      setLoading(false)
      navigate("/instructor/courses")
    }
  }

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target
    setBasicInfo({
      ...basicInfo,
      [name]: value,
    })
  }

  const handlePricingInfoChange = (e) => {
    const { name, value, type, checked } = e.target
    setPricingInfo({
      ...pricingInfo,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSettingsInfoChange = (e) => {
    const { name, checked } = e.target
    setSettingsInfo({
      ...settingsInfo,
      [name]: checked,
    })
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      setThumbnail(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNewLessonChange = (e) => {
    const { name, value } = e.target
    setNewLesson({
      ...newLesson,
      [name]: value,
    })
  }

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true)

      const updateData = {
        ...basicInfo,
        tags: basicInfo.tags.split(",").map((tag) => tag.trim()),
      }

      await api.put(`/courses/${courseId}`, updateData)

      // Upload thumbnail if exists
      if (thumbnail) {
        const thumbnailFormData = new FormData()
        thumbnailFormData.append("thumbnail", thumbnail)

        await api.put(`/courses/${courseId}`, thumbnailFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      }

      toast.success("Basic information updated successfully")
      fetchCourseDetails() // Refresh data
    } catch (error) {
      console.error("Error updating basic info:", error)
      toast.error("Failed to update basic information")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePricingInfo = async () => {
    try {
      setSaving(true)

      await api.put(`/courses/${courseId}`, pricingInfo)

      toast.success("Pricing information updated successfully")
      fetchCourseDetails() // Refresh data
    } catch (error) {
      console.error("Error updating pricing info:", error)
      toast.error("Failed to update pricing information")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettingsInfo = async () => {
    try {
      setSaving(true)

      await api.put(`/courses/${courseId}`, settingsInfo)

      toast.success("Settings updated successfully")
      fetchCourseDetails() // Refresh data
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  const handleAddLesson = async (e) => {
    e.preventDefault()

    if (!newLesson.title || !newLesson.description || !newLesson.content) {
      return toast.error("Please fill in all required fields")
    }

    try {
      setSaving(true)

      await api.post(`/courses/${courseId}/lessons`, newLesson)

      toast.success("Lesson added successfully")

      // Reset form
      setNewLesson({
        title: "",
        description: "",
        content: "",
        contentType: "text",
        videoUrl: "",
        pdfUrl: "",
        duration: 0,
        order: lessons.length + 1,
      })

      fetchCourseDetails() // Refresh data
    } catch (error) {
      console.error("Error adding lesson:", error)
      toast.error("Failed to add lesson")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return
    }

    try {
      setSaving(true)

      // In a real app, you would have an API endpoint for this
      // For now, we'll update the course without this lesson
      const updatedLessons = lessons.filter((lesson) => lesson._id !== lessonId)

      await api.put(`/courses/${courseId}`, { lessons: updatedLessons })

      toast.success("Lesson deleted successfully")
      fetchCourseDetails() // Refresh data
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast.error("Failed to delete lesson")
    } finally {
      setSaving(false)
    }
  }

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
          <h1 className="text-2xl font-bold mb-2">Edit Course: {course.title}</h1>
          <p className="text-gray-600">Update your course information and content</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Preview
          </button>
          <button
            onClick={() => navigate("/instructor/courses")}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Courses
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("basic")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "basic"
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "content"
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Course Content
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pricing"
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content - 2/3 width */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={basicInfo.title}
                      onChange={handleBasicInfoChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={basicInfo.description}
                      onChange={handleBasicInfoChange}
                      rows="5"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={basicInfo.category}
                        onChange={handleBasicInfoChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      >
                        <option value="Business">Business</option>
                        <option value="Technology">Technology</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty Level
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={basicInfo.difficulty}
                        onChange={handleBasicInfoChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={basicInfo.tags}
                      onChange={handleBasicInfoChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="e.g., web development, javascript, react"
                    />
                  </div>
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Course Thumbnail</h2>
                    <div className="border rounded-md p-4">
                      <div className="mb-4">
                        {thumbnailPreview ? (
                          <img
                            src={thumbnailPreview || "/placeholder.svg"}
                            alt="Thumbnail Preview"
                            className="w-full h-40 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md">
                            <span className="text-gray-500">No thumbnail selected</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Thumbnail</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-dark"
                        />
                        <p className="mt-1 text-xs text-gray-500">Recommended size: 1280x720 pixels (16:9 ratio)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveBasicInfo}
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Course Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Course Lessons</h2>

                {lessons.length > 0 ? (
                  <div className="space-y-4 mb-8">
                    {lessons.map((lesson, index) => (
                      <div key={lesson._id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm mr-2">
                                {index + 1}
                              </span>
                              <h3 className="font-medium">{lesson.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <span className="mr-3">
                                <i className="fas fa-clock mr-1"></i>
                                {lesson.duration} mins
                              </span>
                              <span>
                                <i className="fas fa-file-alt mr-1"></i>
                                {lesson.contentType}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteLesson(lesson._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-md text-center mb-8">
                    <p className="text-gray-500">No lessons added yet. Add your first lesson below.</p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Add New Lesson</h2>
                <form onSubmit={handleAddLesson} className="border rounded-md p-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Lesson Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lessonTitle"
                        name="title"
                        value={newLesson.title}
                        onChange={handleNewLessonChange}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="lessonDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="lessonDescription"
                        name="description"
                        value={newLesson.description}
                        onChange={handleNewLessonChange}
                        rows="2"
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                          Content Type
                        </label>
                        <select
                          id="contentType"
                          name="contentType"
                          value={newLesson.contentType}
                          onChange={handleNewLessonChange}
                          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                        >
                          <option value="text">Text</option>
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          id="duration"
                          name="duration"
                          value={newLesson.duration}
                          onChange={handleNewLessonChange}
                          min="0"
                          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                        />
                      </div>
                    </div>

                    {newLesson.contentType === "video" && (
                      <div>
                        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                          Video URL
                        </label>
                        <input
                          type="url"
                          id="videoUrl"
                          name="videoUrl"
                          value={newLesson.videoUrl}
                          onChange={handleNewLessonChange}
                          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                          placeholder="e.g., https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    )}

                    {newLesson.contentType === "pdf" && (
                      <div>
                        <label htmlFor="pdfUrl" className="block text-sm font-medium text-gray-700 mb-1">
                          PDF URL
                        </label>
                        <input
                          type="url"
                          id="pdfUrl"
                          name="pdfUrl"
                          value={newLesson.pdfUrl}
                          onChange={handleNewLessonChange}
                          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                          placeholder="e.g., https://example.com/document.pdf"
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="lessonContent" className="block text-sm font-medium text-gray-700 mb-1">
                        Lesson Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="lessonContent"
                        name="content"
                        value={newLesson.content}
                        onChange={handleNewLessonChange}
                        rows="6"
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                        required
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                      >
                        {saving ? "Adding..." : "Add Lesson"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPaid"
                      name="isPaid"
                      checked={pricingInfo.isPaid}
                      onChange={handlePricingInfoChange}
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                    />
                    <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                      This is a paid course
                    </label>
                  </div>

                  {pricingInfo.isPaid && (
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={pricingInfo.price}
                        onChange={handlePricingInfoChange}
                        min="0"
                        step="0.01"
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      />
                    </div>
                  )}

                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <i className="fas fa-info-circle mr-1"></i>
                      Setting a price for your course will make it available for purchase. Students will need to pay to
                      enroll.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t flex justify-end">
                  <button
                    onClick={handleSavePricingInfo}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Publishing</h2>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublished"
                        name="isPublished"
                        checked={settingsInfo.isPublished}
                        onChange={handleSettingsInfoChange}
                        className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                      />
                      <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                        Publish this course
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {settingsInfo.isPublished
                        ? "Your course is currently published and visible to students."
                        : "Your course is currently in draft mode and not visible to students."}
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <i className="fas fa-info-circle mr-1"></i>
                      Before publishing, make sure your course has all the necessary content and information.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t flex justify-end">
                  <button
                    onClick={handleSaveSettingsInfo}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditCourse

