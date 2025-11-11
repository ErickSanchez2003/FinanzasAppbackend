import { AlertTriangle, AlertCircle } from "lucide-react"

const InventoryAlerts = ({ alerts }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Alertas de Inventario</h3>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 ${
              alert.nivel === "critico" ? "bg-rose-50 border-rose-500" : "bg-amber-50 border-amber-500"
            }`}
          >
            <div className="flex items-start gap-3">
              {alert.nivel === "critico" ? (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-slate-900">{alert.producto}</p>
                <p className="text-sm text-slate-600 mt-1">
                  Stock actual: <span className="font-medium">{alert.stockActual}</span> unidades
                </p>
                <p className="text-sm text-slate-600">
                  Stock mínimo: <span className="font-medium">{alert.stockMinimo}</span> unidades
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InventoryAlerts
