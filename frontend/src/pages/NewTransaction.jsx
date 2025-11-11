"use client"

import { useNavigate } from "react-router-dom"
import TransactionForm from "../components/TransactionForm"

const NewTransaction = () => {
  const navigate = useNavigate()

  const handleSaved = () => {
    navigate("/transactions")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Nueva Transacción</h1>
        <TransactionForm onSaved={handleSaved} />
      </main>
    </div>
  )
}

export default NewTransaction
