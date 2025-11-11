import { useState } from "react"
import api from "../services/api"

// Categorías predefinidas de productos
const CATEGORIAS = [
  "Materiales construcción",
  "Herramientas manuales",
  "Herramientas eléctricas",
  "Plomería",
  "Electricidad",
  "Pinturas",
  "Cerrajería",
  "Tornillería",
  "Jardinería",
  "Otros"
]

// Unidades de medida comunes
const UNIDADES = [
  "unidad",
  "kg",
  "m",
  "m²",
  "m³",
  "l",
  "par",
  "docena",
  "rollo",
  "caja"
]

const ProductForm = ({ initial = {}, onSaved }) => {
  const [form, setForm] = useState({
    nombre: initial.nombre || "",
    descripcion: initial.descripcion || "",
    codigo: initial.codigo || "",
    precio: initial.precio || "",
    stock: initial.stock || 0,
    stockMinimo: initial.stockMinimo || 5,
    unidad: initial.unidad || "unidad",
    categoria: initial.categoria || CATEGORIAS[0],
    proveedor: initial.proveedor || "",
    ubicacion: initial.ubicacion || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initial && initial._id) {
        await api.put(`/products/${initial._id}`, form)
      } else {
        await api.post("/products", form)
      }
      onSaved()
    } catch (error) {
      console.error("Error guardando producto:", error)
      alert(error.response?.data?.message || "Error guardando")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-700 mb-1">Nombre del producto</label>
          <input
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Cemento Portland 50kg"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Código/SKU</label>
          <input
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="CEM-50"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Categoría</label>
          <select
            required
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Precio unitario</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            placeholder="25000"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Stock actual</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Stock mínimo</label>
          <input
            type="number"
            min="0"
            value={form.stockMinimo}
            onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Unidad de medida</label>
          <select
            value={form.unidad}
            onChange={(e) => setForm({ ...form, unidad: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {UNIDADES.map((unidad) => (
              <option key={unidad} value={unidad}>{unidad}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-1">Proveedor</label>
          <input
            value={form.proveedor}
            onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Nombre del proveedor"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-1">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Detalles adicionales del producto..."
        />
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-1">Ubicación en almacén</label>
        <input
          value={form.ubicacion}
          onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Estante A-12"
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">
          {loading ? "Guardando..." : (initial._id ? "Actualizar producto" : "Crear producto")}
        </button>
      </div>
    </form>
  )
}

export default ProductForm