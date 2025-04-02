"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

const ManageUsers = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all") // 'all', 'admin', 'instructor', 'student'
  const [searchTerm, setSearchTerm] = useState("")

  // New user form
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, config)

      setUsers(response.data.data || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
      setLoading(false)
    }
  }

  const handleNewUserChange = (e) => {
    const { name, value } = e.target
    setNewUser({
      ...newUser,
      [name]: value,
    })
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()

    if (!newUser.name || !newUser.email || !newUser.password) {
      return toast.error("Please fill in all required fields")
    }

    try {
      setFormLoading(true)

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users`, newUser, config)

      toast.success("User created successfully")

      // Reset form
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "student",
      })

      setShowNewUserForm(false)
      fetchUsers() // Refresh data
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(error.response?.data?.message || "Failed to create user")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }

      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, config)

      toast.success("User deleted successfully")
      fetchUsers() // Refresh data
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, { role: newRole }, config)

      toast.success("User role updated successfully")
      fetchUsers() // Refresh data
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    }
  }

  const filteredUsers = () => {
    let filtered = users

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((user) => user.role === activeTab)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Manage Users</h1>
          <p className="text-gray-600">Create, edit, and manage user accounts</p>
        </div>
        <button
          onClick={() => setShowNewUserForm(!showNewUserForm)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Create New User
        </button>
      </div>

      {/* New User Form */}
      {showNewUserForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowNewUserForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                {formLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
            />
          </div>
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-l-md ${
                activeTab === "all" ? "bg-accent text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 ${
                activeTab === "admin" ? "bg-accent text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setActiveTab("instructor")}
              className={`px-4 py-2 ${
                activeTab === "instructor" ? "bg-accent text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Instructors
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`px-4 py-2 rounded-r-md ${
                activeTab === "student" ? "bg-accent text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Students
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {activeTab === "all"
              ? "All Users"
              : activeTab === "admin"
                ? "Administrators"
                : activeTab === "instructor"
                  ? "Instructors"
                  : "Students"}{" "}
            ({filteredUsers().length})
          </h2>
        </div>

        {filteredUsers().length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Joined
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Courses
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers().map((userData) => (
                  <tr key={userData._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={userData.profilePicture || "/placeholder.svg?height=40&width=40"}
                            alt={userData.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={userData.role}
                        onChange={(e) => handleUpdateUserRole(userData._id, e.target.value)}
                        className={`text-xs font-semibold rounded px-2 py-1 ${
                          userData.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : userData.role === "instructor"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="instructor">Instructor</option>
                        <option value="student">Student</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.role === "instructor"
                        ? userData.coursesCreated || 0
                        : userData.enrolledCourses?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/admin/users/${userData._id}`} className="text-accent hover:text-accent-dark">
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(userData._id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={userData._id === user._id} // Prevent deleting self
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageUsers

