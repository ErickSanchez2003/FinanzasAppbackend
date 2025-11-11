"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { Package, Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (selectedCategory) params.append("categoria", selectedCategory)
      
      const res = await api.get(`/products?${params}`)
      setProducts(res.data)
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get("/products/categories/list")
      setCategories(res.data)
    } catch (error) {
      console.error("Error cargando categorías:", error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return
    try {
      await api.delete(`/products/${id}`)
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch (error) {
      console.error("Error eliminando producto:", error)
      alert(error.response?.data?.message || "Error eliminando")
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return <div className="p-6">Cargando productos...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-7 h-7" />
            Inventario
          </h1>
          <Link to="/products/new" className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-4 border-b border-slate-200">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && fetchProducts()}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  fetchProducts()
                }}
                className="p-2 border rounded-lg"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button
                onClick={fetchProducts}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Buscar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Producto</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Categoría</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Precio</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Stock</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-600">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{product.nombre}</p>
                          <p className="text-sm text-slate-600">{product.codigo || "Sin código"}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{product.categoria}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(product.precio)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium">{product.stock}</span>
                          {product.stock <= product.stockMinimo && (
                            <AlertTriangle className="w-5 h-5 text-amber-500" title="Stock bajo" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${product._id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Products