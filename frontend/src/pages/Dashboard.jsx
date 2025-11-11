"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import DashboardHeader from "../components/DashboardHeader"
import StatsCards from "../components/StatsCards"
import RevenueChart from "../components/RevenueChart"
import CashFlowChart from "../components/CashFlowChart"
import RecentTransactions from "../components/RecentTransactions"
import InventoryAlerts from "../components/InventoryAlerts"
import QuickActions from "../components/QuickActions"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, transactionsRes, alertsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/transactions"),
        api.get("/dashboard/inventory-alerts"),
      ])

      setStats(statsRes.data)
      setTransactions(transactionsRes.data)
      setAlerts(alertsRes.data)
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <StatsCards stats={stats} />

          <div className="grid lg:grid-cols-2 gap-6">
            <RevenueChart data={stats.revenueSeries} />
            <CashFlowChart data={stats.cashflowSeries} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentTransactions transactions={transactions} />
            </div>
            <InventoryAlerts alerts={alerts} />
          </div>

          <QuickActions />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
