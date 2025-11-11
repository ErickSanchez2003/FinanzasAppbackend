"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"
import TransactionForm from "../components/TransactionForm"

const EditTransaction = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransaction()
  }, [])

  const fetchTransaction = async () => {
    try {
      const res = await api.get(`/transactions/${id}`)
      setTx(res.data)
    } catch (error) {
      console.error("Error cargando transacción:", error)
      alert("No se pudo cargar la transacción")
      navigate("/transactions")
    } finally {
      setLoading(false)
    }
  }

  const handleSaved = () => {
    navigate("/transactions")
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Editar Transacción</h1>
        <TransactionForm initial={tx} onSaved={handleSaved} />
      </main>
    </div>
  )
}

export default EditTransaction
