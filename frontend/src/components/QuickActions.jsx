import { Plus, FileText, Package, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"

const QuickActions = () => {
  const actions = [
  { icon: Plus, label: "Nueva Transacción", color: "blue", to: "/transactions" },
  { icon: FileText, label: "Generar Reporte", color: "emerald", to: "#" },
  { icon: Package, label: "Gestionar Inventario", color: "violet", to: "/inventory" },
  { icon: TrendingUp, label: "Ver Pronósticos", color: "amber", to: "#" },
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Acciones Rápidas</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          const content = (
            <div className={`flex flex-col items-center gap-3 p-6 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-xl transition-colors`}>
              <div className={`p-3 bg-white rounded-lg shadow-sm`}>
                <Icon className={`w-6 h-6 text-${action.color}-600`} />
              </div>
              <span className="text-sm font-medium text-slate-900 text-center">{action.label}</span>
            </div>
          )

          return action.to && action.to !== "#" ? (
            <Link key={action.label} to={action.to}>
              {content}
            </Link>
          ) : (
            <div key={action.label}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActions
