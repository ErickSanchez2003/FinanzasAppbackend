import express from "express"
import { authMiddleware } from "../middleware/auth.js"
import Transaction from "../models/Transaction.js"
import Product from "../models/Product.js"

const router = express.Router()

// Obtener datos del dashboard (totales y series mensuales)
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id

    // Totales: ingresos y gastos (suma absoluta para gastos)
    const totalsAgg = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalIngresos: {
            $sum: { $cond: [{ $eq: ["$tipo", "ingreso"] }, "$monto", 0] },
          },
          totalGastos: {
            $sum: { $cond: [{ $eq: ["$tipo", "gasto"] }, { $abs: "$monto" }, 0] },
          },
        },
      },
    ])

    const totals = totalsAgg[0] || { totalIngresos: 0, totalGastos: 0 }
    const flujoCaja = (totals.totalIngresos || 0) - (totals.totalGastos || 0)

    // Series mensuales (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)

    const monthlyAgg = await Transaction.aggregate([
      { $match: { user: userId, fecha: { $gte: sixMonthsAgo } } },
      {
        $project: {
          year: { $year: "$fecha" },
          month: { $month: "$fecha" },
          monto: 1,
          tipo: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month", type: "$tipo" },
          total: { $sum: { $cond: [{ $eq: ["$tipo", "gasto"] }, { $abs: "$monto" }, "$monto"] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    // Build series for the last 6 months
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString("es-CO", { month: "short" }) })
    }

    const revenueSeries = months.map((m) => {
      const ingresoEntry = monthlyAgg.find((a) => a._id.year === m.year && a._id.month === m.month && a._id.type === "ingreso")
      const gastoEntry = monthlyAgg.find((a) => a._id.year === m.year && a._id.month === m.month && a._id.type === "gasto")
      return {
        mes: m.label,
        ingresos: ingresoEntry ? ingresoEntry.total : 0,
        gastos: gastoEntry ? gastoEntry.total : 0,
      }
    })

    const cashflowSeries = revenueSeries.map((r) => ({ mes: r.mes, flujo: (r.ingresos || 0) - (r.gastos || 0) }))

    // Inventario: suma del stock de todos los productos del usuario
    const stockAgg = await Product.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalStock: { $sum: "$stock" } } },
    ])
    const inventarioTotal = (stockAgg[0] && stockAgg[0].totalStock) ? stockAgg[0].totalStock : 0

    const stats = {
      ingresos: { total: totals.totalIngresos || 0, cambio: 0, tendencia: totals.totalIngresos >= totals.totalGastos ? "up" : "down" },
      gastos: { total: totals.totalGastos || 0, cambio: 0, tendencia: totals.totalGastos > totals.totalIngresos ? "up" : "down" },
      flujoCaja: { total: flujoCaja || 0, cambio: 0, tendencia: flujoCaja >= 0 ? "up" : "down" },
      inventario: { total: inventarioTotal, cambio: 0, tendencia: "down" },
      revenueSeries,
      cashflowSeries,
    }

    res.json(stats)
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Obtener transacciones recientes (mantener /dashboard/transactions como alias)
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ fecha: -1 }).limit(20)
    res.json(transactions)
  } catch (error) {
    console.error("Error obteniendo transacciones:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Obtener alertas de inventario: simple derivado basado en productoId (fallback)
router.get("/inventory-alerts", authMiddleware, async (req, res) => {
  try {
    // Placeholder: si existe modelo Product se debería consultar stock real.
    // Por ahora devolvemos vacíos o basados en transacciones.
    const alerts = []
    res.json(alerts)
  } catch (error) {
    console.error("Error obteniendo alertas:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

export default router
