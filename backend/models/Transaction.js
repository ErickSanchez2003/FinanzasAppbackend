import mongoose from "mongoose"

const TransactionSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: true, default: Date.now },
    monto: { type: Number, required: true },
    tipo: { type: String, enum: ["ingreso", "gasto"], required: true },
    cantidad: { type: Number, required: false, default: 0 },
    categoria: { type: String, default: "General" },
    descripcion: { type: String },
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

const Transaction = mongoose.model("Transaction", TransactionSchema)

export default Transaction
