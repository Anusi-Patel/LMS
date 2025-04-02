"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"

const QuizResults = () => {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizResponse, resultsResponse] = await Promise.all([
          api.get(`/quizzes/${quizId}`),
          api.get(`/quizzes/${quizId}/results`),
        ])

        if (quizResponse.data.success) {
          setQuiz(quizResponse.data.quiz)
        }

        if (resultsResponse.data.success) {
          setResults(resultsResponse.data.results)
        }
      } catch (error) {
        console.error("Error fetching quiz results:", error)
        toast.error("Failed to load quiz results")
        navigate(`/instructor/courses/${courseId}/quizzes`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [quizId, courseId, navigate])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Quiz not found</h2>
            <p className="mt-2 text-gray-600">The quiz you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate(`/instructor/courses/${courseId}/quizzes`)}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
            >
              Return to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const calculateStats = () => {
    const totalAttempts = results.length
    const passedAttempts = results.filter((result) => result.passed).length
    const averageScore = results.reduce((acc, result) => acc + result.score, 0) / totalAttempts
    const averageTime = results.reduce((acc, result) => acc + result.timeTaken, 0) / totalAttempts

    return {
      totalAttempts,
      passedAttempts,
      passRate: (passedAttempts / totalAttempts) * 100,
      averageScore,
      averageTime,
    }
  }

  const stats = calculateStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="mt-1 text-gray-600">{quiz.description}</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Attempts</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{stats.totalAttempts}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Pass Rate</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{stats.passRate.toFixed(1)}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Average Score</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={result.student.profilePicture || "/default-avatar.png"}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {result.student.firstName} {result.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{result.student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.score}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.timeTaken} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate(`/instructor/courses/${courseId}/quizzes`)}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizResults 