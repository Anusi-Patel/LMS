import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Welcome to Learning Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your gateway to knowledge and skill development
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/courses"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Courses
            </Link>
            <Link
              to="/register"
              className="bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

