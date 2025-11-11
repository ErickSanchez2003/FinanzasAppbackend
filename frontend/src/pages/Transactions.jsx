"use client"

import { useEffect, useState } from "react"
import api from "../services/api"
import { Link } from "react-router-dom"

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions")
      setTransactions(res.data)
    } catch (error) {
      console.error("Error cargando transacciones:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Cargando transacciones...</div>
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta transacción?")) return
    try {
      await api.delete(`/transactions/${id}`)
      setTransactions((prev) => prev.filter((t) => t._id !== id))
    } catch (error) {
      console.error("Error eliminando transacción:", error)
      alert(error.response?.data?.message || "Error eliminando")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Transacciones</h1>
          <Link to="/transactions/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Nueva Transacción
          </Link>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">No hay transacciones</div>
          ) : (
            transactions.map((t) => (
              <div key={t._id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-medium">{t.descripcion || "Sin descripción"}</p>
                  <p className="text-sm text-slate-600">{t.categoria} • {new Date(t.fecha).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`font-semibold ${t.tipo === "ingreso" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.tipo === "ingreso" ? "+" : "-"}{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Math.abs(t.monto))}
                  </div>
                  <Link to={`/transactions/${t._id}/edit`} className="text-sm text-blue-600 hover:underline">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(t._id)} className="text-sm text-rose-600 hover:underline">
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default Transactions
