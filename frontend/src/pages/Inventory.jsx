"use client"

import { useEffect, useState } from "react"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

const Inventory = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ fecha: new Date().toISOString().slice(0, 16), tipo: "entrada", productoNombre: "Tornillos", cantidad: 0, observaciones: "", origen: "", destino: "" })
  const hardwareProducts = [
    "Tornillos",
    "Clavos",
    "Martillo",
    "Destornillador",
    "Cinta métrica",
    "Cable eléctrico",
    "Tubería PVC",
    "Pegante para PVC",
    "Brocha para pintura",
    "Taladro eléctrico",
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pRes, mRes] = await Promise.all([api.get("/products"), api.get("/inventory/movements")])
      setProducts(pRes.data)
      setMovements(mRes.data)
    } catch (error) {
      console.error("Error cargando inventario:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, cantidad: Number(form.cantidad) }
      await api.post("/inventory/movements", payload)
      setForm({ fecha: new Date().toISOString().slice(0, 16), tipo: "entrada", productoId: "", cantidad: 0, observaciones: "", origen: "", destino: "" })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || "Error creando movimiento")
    }
  }

  if (loading) return <div className="p-6">Cargando inventario...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Gestionar Inventario</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Registrar movimiento</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Tipo</label>
                <select className="w-full p-2 border rounded" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>

              <div>
                <label className="block text-sm">Producto</label>
                <select required className="w-full p-2 border rounded" value={form.productoNombre} onChange={(e) => setForm({ ...form, productoNombre: e.target.value })}>
                  {hardwareProducts.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm">Cantidad</label>
                <input required type="number" min={0} className="w-full p-2 border rounded" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm">Observaciones</label>
                <input className="w-full p-2 border rounded" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
              </div>

              {form.tipo === "transferencia" && (
                <>
                  <div>
                    <label className="block text-sm">Origen</label>
                    <input className="w-full p-2 border rounded" value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm">Destino</label>
                    <input className="w-full p-2 border rounded" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} />
                  </div>
                </>
              )}

              <div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Registrar</button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="font-semibold mb-4">Movimientos recientes</h2>
              {movements.length === 0 ? (
                <div>No hay movimientos</div>
              ) : (
                <div className="space-y-3">
                  {movements.map((m) => (
                    <div key={m._id} className="p-3 border rounded flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">{m.tipo} {m.productoId ? `- ${m.productoId.nombre}` : ''}</div>
                        <div className="text-xs text-slate-600">{new Date(m.fecha).toLocaleString()} · {m.usuario?.nombre || m.usuario}</div>
                        <div className="text-sm mt-1">Cantidad: {m.cantidad} · {m.observaciones}</div>
                      </div>
                      <div className="text-sm text-slate-600">{m.productoId ? `stock:${m.productoId.stock}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-semibold mb-4">Productos</h2>
              <div className="grid grid-cols-2 gap-3">
                {products.map((p) => (
                  <div key={p._id} className="p-3 border rounded">
                    <div className="font-medium">{p.nombre}</div>
                    <div className="text-sm text-slate-600">Stock: {p.stock} · Mínimo: {p.stockMinimo}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Inventory
