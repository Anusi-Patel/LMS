import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Spinner from "../common/Spinner"

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Spinner />
  }

  return user?.role === "admin" ? children : <Navigate to="/login" />
}

export default AdminRoute

