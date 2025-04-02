import { Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "./context/AuthContext"
import PrivateRoute from "./components/routing/PrivateRoute"
import InstructorRoute from "./components/routing/InstructorRoute"
import AdminRoute from "./components/routing/AdminRoute"

// Layouts
import MainLayout from "./layouts/MainLayout"
import DashboardLayout from "./layouts/DashboardLayout"

// Public Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import CoursesList from "./pages/CoursesList"
import CourseDetails from "./pages/CourseDetails"
import VerifyCertificate from "./pages/VerifyCertificate"
import NotFound from "./pages/NotFound"

// Student Pages
import StudentDashboard from "./pages/student/Dashboard"
import EnrolledCourses from "./pages/student/EnrolledCourses"
import CourseContent from "./pages/student/CourseContent"
import Certificates from "./pages/student/Certificates"
import Profile from "./pages/student/Profile"
import Discussions from "./pages/student/Discussions"
import DiscussionDetail from "./pages/student/DiscussionDetail"
import Announcements from "./pages/student/Announcements"

// Instructor Pages
import InstructorDashboard from "./pages/instructor/Dashboard"
import ManageCourses from "./pages/instructor/ManageCourses"
import CreateCourse from "./pages/instructor/CreateCourse"
import EditCourse from "./pages/instructor/EditCourse"
import CourseStudents from "./pages/instructor/CourseStudents"
import InstructorDiscussions from "./pages/instructor/InstructorDiscussions"
import InstructorDiscussionDetail from "./pages/instructor/InstructorDiscussionDetail"
import InstructorAnnouncements from "./pages/instructor/InstructorAnnouncements"

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard"
import ManageUsers from "./pages/admin/ManageUsers"
import AllCourses from "./pages/admin/AllCourses"
import SystemSettings from "./pages/admin/SystemSettings"

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:resettoken" element={<ResetPassword />} />
            <Route path="courses" element={<CoursesList />} />
            <Route path="courses/:courseId" element={<CourseDetails />} />
            <Route path="verify-certificate/:certificateId" element={<VerifyCertificate />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="enrolled-courses" element={<EnrolledCourses />} />
            <Route path="course/:courseId" element={<CourseContent />} />
            <Route path="course/:courseId/discussions" element={<Discussions />} />
            <Route path="course/:courseId/discussions/:discussionId" element={<DiscussionDetail />} />
            <Route path="course/:courseId/announcements" element={<Announcements />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Instructor Routes */}
          <Route
            path="/instructor"
            element={
              <InstructorRoute>
                <DashboardLayout />
              </InstructorRoute>
            }
          >
            <Route index element={<InstructorDashboard />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="courses/create" element={<CreateCourse />} />
            <Route path="courses/edit/:courseId" element={<EditCourse />} />
            <Route path="courses/:courseId/students" element={<CourseStudents />} />
            <Route path="courses/:courseId/announcements" element={<InstructorAnnouncements />} />
            <Route path="courses/:courseId/discussions" element={<InstructorDiscussions />} />
            <Route path="courses/:courseId/discussions/:discussionId" element={<InstructorDiscussionDetail />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="courses" element={<AllCourses />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App

