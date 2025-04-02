"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const CoursesList = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    search: "",
    sort: "newest",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchCourses()
  }, [filters, pagination.page])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const { category, difficulty, search, sort } = filters
      const { page, limit } = pagination

      let url = `${import.meta.env.VITE_API_URL}/courses?page=${page}&limit=${limit}&sort=${sort}`

      if (category !== "all") url += `&category=${category}`
      if (difficulty !== "all") url += `&difficulty=${difficulty}`
      if (search) url += `&search=${search}`

      const response = await axios.get(url)

      setCourses(response.data.data)
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching courses:", error)
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 }) // Reset to first page on filter change
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination({ ...pagination, page: 1 }) // Reset to first page on search
  }

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage })
    }
  }

  return (
    <div className="bg-primary/5 min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Explore Courses</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
              >
                <option value="all">All Categories</option>
                <option value="Business">Business</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search courses..."
                  className="w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                />
                <button type="submit" className="bg-accent text-white px-4 py-2 rounded-r-md hover:bg-accent-dark">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
                <img
                  src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary text-accent rounded-full">
                      {course.category}
                    </span>
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                      {course.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center mb-4">
                    <img
                      src={course.instructor.profilePicture || "/placeholder.svg?height=40&width=40"}
                      alt={course.instructor.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-600">{course.instructor.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">
                        <i className="fas fa-star"></i>
                      </span>
                      <span className="text-sm font-medium">
                        {course.averageRating ? course.averageRating.toFixed(1) : "N/A"}
                      </span>
                    </div>
                    <span className="text-accent font-semibold">
                      {course.isPaid ? `$${course.price.toFixed(2)}` : "Free"}
                    </span>
                  </div>
                  <Link
                    to={`/courses/${course._id}`}
                    className="mt-4 block w-full text-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`mx-1 px-3 py-1 rounded-md ${
                  pagination.page === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-accent hover:bg-accent hover:text-white"
                }`}
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {[...Array(pagination.pages)].map((_, index) => {
                const pageNumber = index + 1
                // Show limited page numbers with ellipsis
                if (
                  pageNumber === 1 ||
                  pageNumber === pagination.pages ||
                  (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`mx-1 px-3 py-1 rounded-md ${
                        pagination.page === pageNumber
                          ? "bg-accent text-white"
                          : "bg-white text-accent hover:bg-accent hover:text-white"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                } else if (
                  (pageNumber === 2 && pagination.page > 3) ||
                  (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                ) {
                  return <span key={pageNumber}>...</span>
                } else {
                  return null
                }
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`mx-1 px-3 py-1 rounded-md ${
                  pagination.page === pagination.pages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-accent hover:bg-accent hover:text-white"
                }`}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesList

