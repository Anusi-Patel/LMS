"use client"

import { Link, useLocation } from "react-router-dom"

const Sidebar = ({ sidebarOpen, setSidebarOpen, userRole }) => {
  const location = useLocation()

  // Define navigation items based on user role
  const getNavItems = () => {
    const studentItems = [
      { name: "Dashboard", path: "/dashboard", icon: "home" },
      { name: "My Courses", path: "/dashboard/enrolled-courses", icon: "book-open" },
      { name: "Certificates", path: "/dashboard/certificates", icon: "award" },
      { name: "Profile", path: "/dashboard/profile", icon: "user" },
    ]

    const instructorItems = [
      { name: "Dashboard", path: "/instructor", icon: "home" },
      { name: "My Courses", path: "/instructor/courses", icon: "book-open" },
      { name: "Create Course", path: "/instructor/courses/create", icon: "plus-circle" },
      { name: "Profile", path: "/dashboard/profile", icon: "user" },
    ]

    const adminItems = [
      { name: "Dashboard", path: "/admin", icon: "home" },
      { name: "Users", path: "/admin/users", icon: "users" },
      { name: "Courses", path: "/admin/courses", icon: "book-open" },
      { name: "Settings", path: "/admin/settings", icon: "settings" },
      { name: "Profile", path: "/dashboard/profile", icon: "user" },
    ]

    switch (userRole) {
      case "admin":
        return adminItems
      case "instructor":
        return instructorItems
      default:
        return studentItems
    }
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="text-xl font-bold text-accent">
              LMS Platform
            </Link>
            <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm rounded-md ${
                      location.pathname === item.path ? "bg-accent text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-3">
                      <i className={`fas fa-${item.icon}`}></i>
                    </span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <Link to="/" className="flex items-center text-sm text-gray-700 hover:text-accent">
              <span className="mr-3">
                <i className="fas fa-sign-out-alt"></i>
              </span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar

