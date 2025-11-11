import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const CashFlowChart = ({ data }) => {
  const fallback = [
    { mes: "Ene", flujo: 13000000 },
    { mes: "Feb", flujo: 14000000 },
    { mes: "Mar", flujo: 13000000 },
    { mes: "Abr", flujo: 16000000 },
    { mes: "May", flujo: 17000000 },
    { mes: "Jun", flujo: 16500000 },
  ]

  const chartData = data && data.length ? data : fallback

  const formatCurrency = (value) => {
    return `$${(value / 1000000).toFixed(1)}M`
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Flujo de Caja Mensual</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="mes" stroke="#64748b" />
          <YAxis tickFormatter={formatCurrency} stroke="#64748b" />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
          />
          <Bar dataKey="flujo" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CashFlowChart
