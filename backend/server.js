import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.js"
import dashboardRoutes from "./routes/dashboard.js"
import transactionsRoutes from "./routes/transactions.js"
import productsRoutes from "./routes/products.js"
import inventoryRoutes from "./routes/inventory.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Conectar a MongoDB
connectDB()

// Middleware
app.use(
  cors(
    
  ),
)
app.use(express.json())

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/transactions", transactionsRoutes)
app.use("/api/products", productsRoutes)
app.use("/api/inventory", inventoryRoutes)

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor funcionando correctamente" })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
