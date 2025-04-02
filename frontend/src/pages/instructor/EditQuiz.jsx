"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"

const EditQuiz = () => {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ],
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${quizId}`)
        if (response.data.success) {
          setQuizData(response.data.quiz)
        }
      } catch (error) {
        console.error("Error fetching quiz:", error)
        toast.error("Failed to load quiz")
        navigate(`/instructor/courses/${courseId}/quizzes`)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, courseId, navigate])

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    setQuizData({ ...quizData, questions: updatedQuestions })
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizData.questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setQuizData({ ...quizData, questions: updatedQuestions })
  }

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ],
    })
  }

  const removeQuestion = (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index)
    setQuizData({ ...quizData, questions: updatedQuestions })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate quiz data
    if (!quizData.title || !quizData.description) {
      return toast.error("Please fill in all required fields")
    }

    if (quizData.questions.length === 0) {
      return toast.error("Please add at least one question")
    }

    for (const question of quizData.questions) {
      if (!question.question || question.options.some((opt) => !opt)) {
        return toast.error("Please fill in all question fields")
      }
    }

    try {
      setSaving(true)

      const response = await api.put(`/quizzes/${quizId}`, quizData)

      if (response.data.success) {
        toast.success("Quiz updated successfully")
        navigate(`/instructor/courses/${courseId}/quizzes`)
      }
    } catch (error) {
      console.error("Error updating quiz:", error)
      toast.error("Failed to update quiz")
    } finally {
      setSaving(false)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Quiz Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quiz Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={quizData.description}
                  onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                  rows="3"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="timeLimit"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) })}
                    min="1"
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  />
                </div>

                <div>
                  <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    id="passingScore"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  />
                </div>

                <div>
                  <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    id="maxAttempts"
                    value={quizData.maxAttempts}
                    onChange={(e) => setQuizData({ ...quizData, maxAttempts: parseInt(e.target.value) })}
                    min="1"
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark"
              >
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {quizData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-md font-medium">Question {questionIndex + 1}</h3>
                    {quizData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
                        rows="2"
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options <span className="text-red-500">*</span>
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name={`correctAnswer-${questionIndex}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => handleQuestionChange(questionIndex, "correctAnswer", optionIndex)}
                            className="text-accent focus:ring-accent"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => handleQuestionChange(questionIndex, "explanation", e.target.value)}
                        rows="2"
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="Explain why this is the correct answer..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/instructor/courses/${courseId}/quizzes`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditQuiz 