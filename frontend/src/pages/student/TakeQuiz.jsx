"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"

const TakeQuiz = () => {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${quizId}`)
        if (response.data.success) {
          setQuiz(response.data.quiz)
          setTimeLeft(response.data.quiz.timeLimit * 60) // Convert minutes to seconds
        }
      } catch (error) {
        console.error("Error fetching quiz:", error)
        toast.error("Failed to load quiz")
        navigate(`/student/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, courseId, navigate])

  useEffect(() => {
    if (!timeLeft) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = async () => {
    if (submitting) return

    try {
      setSubmitting(true)

      const response = await api.post(`/quizzes/${quizId}/submit`, {
        answers,
      })

      if (response.data.success) {
        const { score, passed, feedback } = response.data
        toast.success(`Quiz submitted! Score: ${score}%`)
        
        // Show feedback modal
        const message = passed
          ? "Congratulations! You passed the quiz!"
          : "You didn't pass this time. Review the material and try again."
        
        alert(`${message}\n\nScore: ${score}%\n\n${feedback}`)
        
        navigate(`/student/courses/${courseId}`)
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="mt-1 text-gray-600">{quiz.description}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">Time Left</div>
              <div className={`text-2xl font-bold ${timeLeft < 300 ? "text-red-600" : "text-gray-900"}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {quiz.questions.map((question, index) => (
              <div key={question._id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`question-${question._id}`}
                            value={optionIndex}
                            checked={answers[question._id] === optionIndex}
                            onChange={() => handleAnswerChange(question._id, optionIndex)}
                            className="h-4 w-4 text-accent focus:ring-accent border-gray-300"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-3 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz 