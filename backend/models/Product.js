import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String },
    codigo: { type: String },  // SKU o código interno
    precio: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    stockMinimo: { type: Number, default: 5 },
    unidad: { type: String, default: "unidad" },  // unidad, kg, m, etc.
    categoria: { type: String, required: true },
    proveedor: { type: String },
    ubicacion: { type: String },  // ubicación en almacén
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // dueño/empresa
  },
  { timestamps: true }
)

// Índices para búsquedas frecuentes
ProductSchema.index({ nombre: 1, user: 1 })
ProductSchema.index({ codigo: 1, user: 1 })
ProductSchema.index({ categoria: 1, user: 1 })

const Product = mongoose.model("Product", ProductSchema)

export default Product