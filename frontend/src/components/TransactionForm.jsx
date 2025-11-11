import { useState } from "react"
import api from "../services/api"

// Categorías predefinidas por tipo
const categorias = {
  ingreso: [
    "Ventas",
    "Servicios",
    "Anticipos",
    "Préstamos",
    "Otros ingresos"
  ],
  gasto: [
    "Compra inventario",
    "Salarios",
    "Servicios públicos",
    "Arriendo",
    "Transporte",
    "Marketing",
    "Mantenimiento",
    "Impuestos",
    "Otros gastos"
  ]
}

const TransactionForm = ({ initial = {}, onSaved }) => {
  const [form, setForm] = useState({
    fecha: initial.fecha ? new Date(initial.fecha).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    monto: initial.monto || "",
    tipo: initial.tipo || "ingreso",
    categoria: initial.categoria || "Ventas",
    descripcion: initial.descripcion || "",
    productoNombre: initial.productoNombre || "",
    cantidad: initial.cantidad || 0,
  })
  const [loading, setLoading] = useState(false)

  // Lista fija de productos de ferretería
  const hardwareProducts = [
    "Tornillos",
    "Tuercas",
    "Arandelas",
    "Lijas",
    "Clavos",
    "Taladros",
    "Brocas",
    "Martillos",
    "Cintas adhesivas",
    "Pintura",
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initial && initial._id) {
        await api.put(`/transactions/${initial._id}`, { ...form, monto: Number(form.monto), cantidad: Number(form.cantidad), productoNombre: form.productoNombre })
      } else {
        await api.post("/transactions", { ...form, monto: Number(form.monto), cantidad: Number(form.cantidad), productoNombre: form.productoNombre })
      }
      onSaved()
    } catch (error) {
      console.error("Error guardando transacción:", error)
      alert(error.response?.data?.message || "Error guardando")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <div>
        <label className="block text-sm text-slate-700 mb-1">Fecha</label>
        <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-1">Monto (COP)</label>
        <input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} className="w-full p-2 border rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-700 mb-1">Tipo</label>
          <select 
            value={form.tipo} 
            onChange={(e) => setForm({ ...form, tipo: e.target.value, categoria: categorias[e.target.value][0] })} 
            className="w-full p-2 border rounded"
          >
            <option value="ingreso">Ingreso</option>
            <option value="gasto">Gasto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Categoría</label>
          <select 
            value={form.categoria} 
            onChange={(e) => setForm({ ...form, categoria: e.target.value })} 
            className="w-full p-2 border rounded"
          >
            {categorias[form.tipo].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-1">Descripción</label>
        <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full p-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-1">Producto (ferretería)</label>
        <select required value={form.productoNombre} onChange={(e) => setForm({ ...form, productoNombre: e.target.value })} className="w-full p-2 border rounded">
          {hardwareProducts.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-1">Cantidad (unidades)</label>
        <input type="number" min={0} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} className="w-full p-2 border rounded" />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">
          {loading ? "Guardando..." : "Guardar transacción"}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
