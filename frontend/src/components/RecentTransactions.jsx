import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const RecentTransactions = ({ transactions }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(Math.abs(value))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Transacciones Recientes</h3>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${transaction.tipo === "ingreso" ? "bg-emerald-100" : "bg-rose-100"}`}>
                {transaction.tipo === "ingreso" ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{transaction.descripcion}</p>
                <p className="text-sm text-slate-600">{transaction.categoria}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${transaction.tipo === "ingreso" ? "text-emerald-600" : "text-rose-600"}`}>
                {transaction.tipo === "ingreso" ? "+" : "-"}
                {formatCurrency(transaction.monto)}
              </p>
              <p className="text-sm text-slate-600">{formatDate(transaction.fecha)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentTransactions
