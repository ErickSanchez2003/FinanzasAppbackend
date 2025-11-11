import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  nombreEmpresa: {
    type: String,
    required: true,
    trim: true,
  },
  rol: {
    type: String,
    enum: ["dueño", "empleado"],
    default: "dueño",
  },
  telefono: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("User", userSchema)
