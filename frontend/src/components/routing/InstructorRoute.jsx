import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Spinner from "../common/Spinner"

const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Spinner />
  }

  return user?.role === "instructor" ? children : <Navigate to="/login" />
}

export default InstructorRoute

