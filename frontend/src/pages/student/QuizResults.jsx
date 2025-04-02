"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"

const QuizResults = () => {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
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
        navigate(`/student/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
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

  if (!quiz || !results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Results not found</h2>
            <p className="mt-2 text-gray-600">The quiz results you're looking for don't exist or you don't have access to them.</p>
            <button
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
            >
              Return to Course
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="mt-1 text-gray-600">{quiz.description}</p>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Score</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{results.score}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className={`mt-1 text-2xl font-bold ${results.passed ? "text-green-600" : "text-red-600"}`}>
                  {results.passed ? "Passed" : "Failed"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Time Taken</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{results.timeTaken} minutes</div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-lg font-semibold text-gray-900">Question Review</h2>
            {results.answers.map((answer, index) => (
              <div key={index} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    answer.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{quiz.questions[index].question}</h3>
                    <div className="space-y-2">
                      {quiz.questions[index].options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded ${
                            optionIndex === answer.selectedAnswer
                              ? answer.isCorrect
                                ? "bg-green-50 border border-green-200"
                                : "bg-red-50 border border-red-200"
                              : optionIndex === quiz.questions[index].correctAnswer
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={optionIndex === answer.selectedAnswer}
                              readOnly
                              className={`h-4 w-4 ${
                                optionIndex === answer.selectedAnswer
                                  ? answer.isCorrect
                                    ? "text-green-600"
                                    : "text-red-600"
                                  : optionIndex === quiz.questions[index].correctAnswer
                                  ? "text-green-600"
                                  : "text-gray-300"
                              }`}
                            />
                            <span className="text-gray-700">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {quiz.questions[index].explanation && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 mb-1">Explanation</div>
                        <p className="text-blue-700">{quiz.questions[index].explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Return to Course
            </button>
            {!results.passed && (
              <button
                onClick={() => navigate(`/student/courses/${courseId}/quizzes/${quizId}/take`)}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
              >
                Retake Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizResults 