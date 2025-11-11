import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../services/api"
import { Package } from "lucide-react"

const ProductForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(isEditing)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    codigo: "",
    categoria: "",
    precio: "",
    stock: "",
    stockMinimo: "",
  })

  useEffect(() => {
    if (isEditing) {
      fetchProduct()
    }
    fetchCategories()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`)
      setForm(res.data)
    } catch (error) {
      console.error("Error cargando producto:", error)
      setError("Error cargando el producto")
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const formData = {
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
      }

      if (isEditing) {
        await api.put(`/products/${id}`, formData)
      } else {
        await api.post("/products", formData)
      }

      navigate("/products")
    } catch (error) {
      console.error("Error guardando producto:", error)
      setError(error.response?.data?.message || "Error al guardar")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-7 h-7" />
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium">
                  Nombre*
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Código
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Categoría*
                </label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Precio*
                </label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Stock Actual*
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Stock Mínimo*
                </label>
                <input
                  type="number"
                  name="stockMinimo"
                  value={form.stockMinimo}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="px-4 py-2 border rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                {isEditing ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ProductForm