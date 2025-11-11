import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const RevenueChart = ({ data }) => {
  const fallback = [
    { mes: "Ene", ingresos: 38000000, gastos: 25000000 },
    { mes: "Feb", ingresos: 42000000, gastos: 28000000 },
    { mes: "Mar", ingresos: 39000000, gastos: 26000000 },
    { mes: "Abr", ingresos: 45000000, gastos: 29000000 },
    { mes: "May", ingresos: 48000000, gastos: 31000000 },
    { mes: "Jun", ingresos: 45250000, gastos: 28750000 },
  ]

  const chartData = data && data.length ? data : fallback

  const formatCurrency = (value) => {
    return `$${(value / 1000000).toFixed(1)}M`
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Ingresos vs Gastos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="mes" stroke="#64748b" />
          <YAxis tickFormatter={formatCurrency} stroke="#64748b" />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
          />
          <Legend />
          <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} name="Ingresos" />
          <Line type="monotone" dataKey="gastos" stroke="#f43f5e" strokeWidth={2} name="Gastos" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
