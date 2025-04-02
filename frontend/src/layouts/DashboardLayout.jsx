import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/navigation/Sidebar"
import DashboardHeader from "../components/navigation/DashboardHeader"
import { useAuth } from "../context/AuthContext"

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-primary/5">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userRole={user?.role} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

