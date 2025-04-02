"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { toast } from "sonner"

const QuizSettings = () => {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [settings, setSettings] = useState({
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
    showResults: true,
    showExplanations: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    requirePassword: false,
    password: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${quizId}`)
        if (response.data.success) {
          setQuiz(response.data.quiz)
          setSettings({
            timeLimit: response.data.quiz.timeLimit || 30,
            passingScore: response.data.quiz.passingScore || 70,
            maxAttempts: response.data.quiz.maxAttempts || 3,
            showResults: response.data.quiz.showResults ?? true,
            showExplanations: response.data.quiz.showExplanations ?? true,
            randomizeQuestions: response.data.quiz.randomizeQuestions ?? false,
            randomizeOptions: response.data.quiz.randomizeOptions ?? false,
            requirePassword: response.data.quiz.requirePassword ?? false,
            password: response.data.quiz.password || "",
          })
        }
      } catch (error) {
        console.error("Error fetching quiz:", error)
        toast.error("Failed to load quiz settings")
        navigate(`/instructor/courses/${courseId}/quizzes`)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, courseId, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return

    try {
      setSaving(true)

      const response = await api.put(`/quizzes/${quizId}/settings`, settings)

      if (response.data.success) {
        toast.success("Quiz settings updated successfully")
        navigate(`/instructor/courses/${courseId}/quizzes/${quizId}/edit`)
      }
    } catch (error) {
      console.error("Error updating quiz settings:", error)
      toast.error("Failed to update quiz settings")
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Settings</h1>
            <p className="mt-1 text-gray-600">{quiz.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Settings */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="timeLimit"
                    value={settings.timeLimit}
                    onChange={(e) => setSettings({ ...settings, timeLimit: parseInt(e.target.value) })}
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
                    value={settings.passingScore}
                    onChange={(e) => setSettings({ ...settings, passingScore: parseInt(e.target.value) })}
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
                    value={settings.maxAttempts}
                    onChange={(e) => setSettings({ ...settings, maxAttempts: parseInt(e.target.value) })}
                    min="1"
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                  />
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showResults"
                    checked={settings.showResults}
                    onChange={(e) => setSettings({ ...settings, showResults: e.target.checked })}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                  />
                  <label htmlFor="showResults" className="ml-2 block text-sm text-gray-900">
                    Show results after submission
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showExplanations"
                    checked={settings.showExplanations}
                    onChange={(e) => setSettings({ ...settings, showExplanations: e.target.checked })}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                  />
                  <label htmlFor="showExplanations" className="ml-2 block text-sm text-gray-900">
                    Show explanations for answers
                  </label>
                </div>
              </div>
            </div>

            {/* Randomization Settings */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Randomization Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="randomizeQuestions"
                    checked={settings.randomizeQuestions}
                    onChange={(e) => setSettings({ ...settings, randomizeQuestions: e.target.checked })}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                  />
                  <label htmlFor="randomizeQuestions" className="ml-2 block text-sm text-gray-900">
                    Randomize question order
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="randomizeOptions"
                    checked={settings.randomizeOptions}
                    onChange={(e) => setSettings({ ...settings, randomizeOptions: e.target.checked })}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                  />
                  <label htmlFor="randomizeOptions" className="ml-2 block text-sm text-gray-900">
                    Randomize answer options
                  </label>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requirePassword"
                    checked={settings.requirePassword}
                    onChange={(e) => setSettings({ ...settings, requirePassword: e.target.checked })}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                  />
                  <label htmlFor="requirePassword" className="ml-2 block text-sm text-gray-900">
                    Require password to start quiz
                  </label>
                </div>

                {settings.requirePassword && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Quiz Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={settings.password}
                      onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-accent focus:border-accent"
                      placeholder="Enter quiz password"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/instructor/courses/${courseId}/quizzes/${quizId}/edit`)}
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
    </div>
  )
}

export default QuizSettings 