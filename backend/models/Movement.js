import mongoose from "mongoose"

const MovementSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: true, default: Date.now },
    tipo: { type: String, enum: ["entrada", "salida", "transferencia", "ajuste"], required: true },
    cantidad: { type: Number, required: true },
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    observaciones: { type: String },
    origen: { type: String },
    destino: { type: String },
    // referencia opcional a transacción u otro documento
    referencia: { type: String },
    previousStock: { type: Number },
  },
  { timestamps: true },
)

const Movement = mongoose.model("Movement", MovementSchema)

export default Movement
