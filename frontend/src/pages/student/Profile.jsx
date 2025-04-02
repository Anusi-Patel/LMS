"use client"

import { useState, useContext, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

const Profile = () => {
  const { user, updateProfile, updateProfilePicture } = useAuth()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }, [user])

  const { name, email, currentPassword, newPassword, confirmPassword } = formData

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      setProfileImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(formData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureUpdate = async (e) => {
    e.preventDefault()

    if (!profileImage) {
      return toast.error("Please select an image")
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("profilePicture", profileImage)

      const success = await updateProfilePicture(formData)

      if (success) {
        toast.success("Profile picture updated successfully")
        setProfileImage(null)
      }
    } catch (error) {
      console.error("Error updating profile picture:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-100">
              {imagePreview ? (
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : user?.profilePicture ? (
                <img
                  src={user.profilePicture || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/30 text-accent">
                  <i className="fas fa-user text-4xl"></i>
                </div>
              )}
            </div>

            <form onSubmit={handleProfilePictureUpdate} className="w-full">
              <div className="mb-4">
                <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload new picture
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-dark"
                />
              </div>

              <button
                type="submit"
                disabled={!profileImage || loading}
                className="w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark disabled:bg-gray-300"
              >
                {loading ? "Updating..." : "Update Picture"}
              </button>
            </form>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium mb-2">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={currentPassword}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={newPassword}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark disabled:bg-gray-300"
                >
                  {loading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrolled Courses</p>
              <p className="font-medium">{user?.enrolledCourses?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Certificates Earned</p>
              <p className="font-medium">{user?.certificates?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

