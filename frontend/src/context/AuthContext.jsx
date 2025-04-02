import { createContext, useContext, useState, useEffect } from "react"
import api from "../utils/api"
import { toast } from "sonner"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      const tokenExpiresAt = localStorage.getItem("tokenExpiresAt")
      console.log('Checking auth - Token:', token ? 'Present' : 'Missing')
      
      // Check if token is expired
      if (tokenExpiresAt && new Date().getTime() > parseInt(tokenExpiresAt)) {
        console.log('Token expired')
        localStorage.removeItem("token")
        localStorage.removeItem("tokenExpiresAt")
        setUser(null)
        return
      }
      
      if (token) {
        const response = await api.get("/auth/me")
        console.log('Auth check response:', response.data)
        
        if (response.data.success) {
          setUser(response.data.data.user)
        } else {
          throw new Error(response.data.message || "Failed to get user data")
        }
      }
    } catch (error) {
      console.error("Auth check error:", error)
      console.error("Auth check error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      localStorage.removeItem("token")
      localStorage.removeItem("tokenExpiresAt")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password
      })

      if (response.data.success) {
        const { token, user, expiresIn } = response.data.data
        
        // Store token with expiration
        const expiresAt = new Date().getTime() + (expiresIn * 1000)
        localStorage.setItem("token", token)
        localStorage.setItem("tokenExpiresAt", expiresAt.toString())
        
        setUser(user)
        toast.success("Login successful!")
        return user
      } else {
        throw new Error(response.data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.")
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)
      
      if (response.data.success) {
        const { token, user, expiresIn } = response.data.data
        
        // Store token with expiration
        const expiresAt = new Date().getTime() + (expiresIn * 1000)
        localStorage.setItem("token", token)
        localStorage.setItem("tokenExpiresAt", expiresAt.toString())
        
        setUser(user)
        toast.success("Registration successful!")
        return user
      } else {
        throw new Error(response.data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.response?.data?.message || "Registration failed. Please try again.")
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("tokenExpiresAt")
    setUser(null)
    toast.success("Logged out successfully")
  }

  const updateProfile = async (userData) => {
    try {
      const response = await api.put("/auth/updateprofile", userData)
      
      if (response.data.success) {
        const { token, user, expiresIn } = response.data.data
        
        // Update token with new expiration
        const expiresAt = new Date().getTime() + (expiresIn * 1000)
        localStorage.setItem("token", token)
        localStorage.setItem("tokenExpiresAt", expiresAt.toString())
        
        setUser(user)
        toast.success("Profile updated successfully")
        return user
      } else {
        throw new Error(response.data.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error(error.response?.data?.message || "Failed to update profile")
      throw error
    }
  }

  const updateProfilePicture = async (formData) => {
    try {
      const response = await api.put("/auth/updateprofilepicture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      if (response.data.success) {
        setUser(response.data.data.user)
        toast.success("Profile picture updated successfully")
        return response.data.data.user
      } else {
        throw new Error(response.data.message || "Failed to update profile picture")
      }
    } catch (error) {
      console.error("Profile picture update error:", error)
      toast.error(error.response?.data?.message || "Failed to update profile picture")
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

