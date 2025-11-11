"use client"

import { useAuth } from "../context/AuthContext"
import { LogOut, User } from "lucide-react"

const DashboardHeader = ({ user }) => {
  const { logout } = useAuth()

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.nombreEmpresa || "Mi Empresa"}</h1>
            <p className="text-sm text-slate-600">Panel de Control Financiero</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
              <User className="w-5 h-5 text-slate-600" />
              <div className="text-sm">
                <p className="font-medium text-slate-900">{user?.nombre}</p>
                <p className="text-slate-600 capitalize">{user?.rol}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
