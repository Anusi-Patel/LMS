import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-accent text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">LMS Platform</h3>
            <p className="text-sm">
              A comprehensive learning management system for students, instructors, and administrators.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm hover:underline">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm hover:underline">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:underline">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm">Email: info@lmsplatform.com</p>
            <p className="text-sm">Phone: +1 (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

