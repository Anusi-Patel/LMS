import { Link, useLocation } from "react-router-dom"

const CourseNavigation = ({ courseId }) => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <nav className="flex space-x-4">
        <Link
          to={`/dashboard/course/${courseId}`}
          className={`px-4 py-2 rounded-md ${
            isActive(`/dashboard/course/${courseId}`)
              ? "bg-accent text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <i className="fas fa-book mr-2"></i>
          Course Content
        </Link>
        <Link
          to={`/dashboard/course/${courseId}/discussions`}
          className={`px-4 py-2 rounded-md ${
            isActive(`/dashboard/course/${courseId}/discussions`)
              ? "bg-accent text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <i className="fas fa-comments mr-2"></i>
          Discussions
        </Link>
        <Link
          to={`/dashboard/course/${courseId}/announcements`}
          className={`px-4 py-2 rounded-md ${
            isActive(`/dashboard/course/${courseId}/announcements`)
              ? "bg-accent text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <i className="fas fa-bullhorn mr-2"></i>
          Announcements
        </Link>
      </nav>
    </div>
  )
}

export default CourseNavigation 