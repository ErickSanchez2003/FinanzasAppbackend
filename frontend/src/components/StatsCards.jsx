import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Wallet, Package } from "lucide-react"

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Ingresos Totales",
      value: stats?.ingresos?.total || 0,
      change: stats?.ingresos?.cambio || 0,
      trend: stats?.ingresos?.tendencia || "up",
      icon: DollarSign,
      color: "emerald",
    },
    {
      title: "Gastos Totales",
      value: stats?.gastos?.total || 0,
      change: stats?.gastos?.cambio || 0,
      trend: stats?.gastos?.tendencia || "down",
      icon: ShoppingCart,
      color: "rose",
    },
    {
      title: "Flujo de Caja",
      value: stats?.flujoCaja?.total || 0,
      change: stats?.flujoCaja?.cambio || 0,
      trend: stats?.flujoCaja?.tendencia || "up",
      icon: Wallet,
      color: "blue",
    },
    {
      title: "Productos en Stock",
      value: stats?.inventario?.total || 0,
      change: stats?.inventario?.cambio || 0,
      trend: stats?.inventario?.tendencia || "down",
      icon: Package,
      color: "violet",
    },
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown
        const trendColor = card.trend === "up" ? "text-emerald-600" : "text-rose-600"
        const bgColor = `bg-${card.color}-50`
        const iconColor = `text-${card.color}-600`

        return (
          <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${bgColor} rounded-lg`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{Math.abs(card.change)}%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-slate-900">
              {typeof card.value === "number" && card.title !== "Productos en Stock"
                ? formatCurrency(card.value)
                : card.value.toLocaleString()}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards
