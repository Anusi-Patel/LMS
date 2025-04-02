"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import { toast } from "sonner"

const CreateCourse = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technology",
    difficulty: "Beginner",
    price: 0,
    isPaid: false,
    isPublished: false,
    tags: "",
  })

  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const { title, description, category, difficulty, price, isPaid, isPublished, tags } = formData

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description || !category) {
      return toast.error("Please fill in all required fields")
    }

    try {
      setLoading(true)

      // Create course with basic info
      const courseData = {
        ...formData,
        tags: tags.split(",").map((tag) => tag.trim()),
      }

      const response = await api.post("/courses", courseData)
      const courseId = response.data.data._id

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

      toast.success("Course created successfully")
      navigate(`/instructor/courses/edit/${courseId}`)
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error("Failed to create course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Create New Course</h1>
        <p className="text-gray-600">Fill in the details to create your new course</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content - 2/3 width */}
            <div className="md:col-span-2 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={title}
                      onChange={onChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="e.g., Complete Web Development Bootcamp"
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
                      value={description}
                      onChange={onChange}
                      rows="5"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="Provide a detailed description of your course"
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
                        value={category}
                        onChange={onChange}
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
                        value={difficulty}
                        onChange={onChange}
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
                      value={tags}
                      onChange={onChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="e.g., web development, javascript, react"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Pricing</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPaid"
                      name="isPaid"
                      checked={isPaid}
                      onChange={onChange}
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                    />
                    <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                      This is a paid course
                    </label>
                  </div>

                  {isPaid && (
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={price}
                        onChange={onChange}
                        min="0"
                        step="0.01"
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Thumbnail */}
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

              {/* Publishing */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Publishing</h2>
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isPublished"
                      name="isPublished"
                      checked={isPublished}
                      onChange={onChange}
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                      Publish this course
                    </label>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    {isPublished
                      ? "Your course will be available to students immediately after creation."
                      : "Your course will be saved as a draft. You can publish it later."}
                  </p>

                  <div className="bg-yellow-50 p-3 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <i className="fas fa-info-circle mr-1"></i>
                      You'll be able to add lessons, quizzes, and assignments after creating the course.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/instructor/courses")}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-4"
            >
              Cancel
            </button>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating Course..." : "Create Course"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCourse

