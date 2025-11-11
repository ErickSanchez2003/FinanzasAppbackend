import express from "express"
import { authMiddleware } from "../middleware/auth.js"
import Transaction from "../models/Transaction.js"
import Product from "../models/Product.js"

const router = express.Router()

// Listar transacciones (con filtros simples)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { start, end, tipo } = req.query
    const filter = { user: req.user._id }
    if (tipo) filter.tipo = tipo
    if (start || end) filter.fecha = {}
    if (start) filter.fecha.$gte = new Date(start)
    if (end) filter.fecha.$lte = new Date(end)

    const transactions = await Transaction.find(filter).sort({ fecha: -1 }).limit(200)
    res.json(transactions)
  } catch (error) {
    console.error("Error listando transacciones:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Obtener una transacción
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id })
    if (!tx) return res.status(404).json({ message: "Transacción no encontrada" })
    res.json(tx)
  } catch (error) {
    console.error("Error obteniendo transacción:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Crear transacción
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { fecha, monto, tipo, categoria, descripcion, productoId, productoNombre, cantidad } = req.body
    if (monto == null || !tipo) return res.status(400).json({ message: "monto y tipo son requeridos" })

    // Determinar producto: si se envía productoNombre pero no productoId, buscar/crear el producto
    let prodId = productoId && String(productoId).trim() !== "" ? productoId : undefined
    if (!prodId && productoNombre && String(productoNombre).trim() !== "") {
      // buscar por nombre para el usuario; si no existe, crearlo con categoría 'Ferreteria'
      let prod = await Product.findOne({ nombre: productoNombre, user: req.user._id })
      if (!prod) {
        prod = new Product({ nombre: productoNombre, precio: 0, categoria: "Ferreteria", user: req.user._id })
        await prod.save()
      }
      prodId = prod._id
    }

    const tx = new Transaction({
      fecha: fecha ? new Date(fecha) : Date.now(),
      monto,
      tipo,
      cantidad: cantidad ? Number(cantidad) : 0,
      categoria,
      descripcion,
      productoId: prodId,
      user: req.user._id,
    })

    // Ajustar stock si aplica (basado en categoría: ventas->salida, compra->entrada)
    if (prodId && tx.cantidad > 0) {
      const cat = (categoria || "").toLowerCase()
      let stockChange = 0
      if (cat.includes("venta")) stockChange = -Math.abs(tx.cantidad)
      else if (cat.includes("compra")) stockChange = Math.abs(tx.cantidad)

      if (stockChange !== 0) {
        if (stockChange < 0) {
          const updated = await Product.findOneAndUpdate({ _id: prodId, stock: { $gte: Math.abs(stockChange) } }, { $inc: { stock: stockChange } }, { new: true })
          if (!updated) return res.status(400).json({ message: "Stock insuficiente o producto no encontrado" })
        } else {
          await Product.findOneAndUpdate({ _id: prodId }, { $inc: { stock: stockChange } })
        }
      }
    }

    await tx.save()
    res.status(201).json(tx)
  } catch (error) {
    console.error("Error creando transacción:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Actualizar transacción
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const existing = await Transaction.findOne({ _id: req.params.id, user: req.user._id })
    if (!existing) return res.status(404).json({ message: "Transacción no encontrada" })

    // Revertir efecto anterior en stock si existía
    if (existing.productoId && existing.cantidad > 0) {
      const productOld = await Product.findOne({ _id: existing.productoId })
      if (productOld) {
        const oldCat = (existing.categoria || "").toLowerCase()
        let oldChange = 0
        if (oldCat.includes("venta")) oldChange = -Math.abs(existing.cantidad)
        else if (oldCat.includes("compra")) oldChange = Math.abs(existing.cantidad)
        // revert: subtract previous change
        await Product.findOneAndUpdate({ _id: existing.productoId }, { $inc: { stock: -oldChange } })
      }
    }

    const updates = req.body
    // Si se manda productoNombre en la actualización, buscar/crear
    let newProdId = updates.productoId && String(updates.productoId).trim() !== "" ? updates.productoId : undefined
    if (!newProdId && updates.productoNombre && String(updates.productoNombre).trim() !== "") {
      let prod = await Product.findOne({ nombre: updates.productoNombre, user: req.user._id })
      if (!prod) {
        prod = new Product({ nombre: updates.productoNombre, precio: 0, categoria: "Ferreteria", user: req.user._id })
        await prod.save()
      }
      newProdId = prod._id
      updates.productoId = newProdId
    }

    const updated = await Transaction.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { ...updates, cantidad: updates.cantidad ? Number(updates.cantidad) : 0 }, { new: true })

    // Aplicar nuevo efecto en stock
    if (updated.productoId && updated.cantidad > 0) {
      const newCat = (updated.categoria || "").toLowerCase()
      let newChange = 0
      if (newCat.includes("venta")) newChange = -Math.abs(updated.cantidad)
      else if (newCat.includes("compra")) newChange = Math.abs(updated.cantidad)

      if (newChange !== 0) {
        if (newChange < 0) {
          const ok = await Product.findOneAndUpdate({ _id: updated.productoId, stock: { $gte: Math.abs(newChange) } }, { $inc: { stock: newChange } }, { new: true })
          if (!ok) return res.status(400).json({ message: "Operación inválida: stock insuficiente" })
        } else {
          await Product.findOneAndUpdate({ _id: updated.productoId }, { $inc: { stock: newChange } })
        }
      }
    }

    res.json(updated)
  } catch (error) {
    console.error("Error actualizando transacción:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Eliminar transacción
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!tx) return res.status(404).json({ message: "Transacción no encontrada" })

    // Revertir stock si la transacción afectó inventario
    if (tx.productoId && tx.cantidad > 0) {
      const cat = (tx.categoria || "").toLowerCase()
      let change = 0
      if (cat.includes("venta")) change = -Math.abs(tx.cantidad)
      else if (cat.includes("compra")) change = Math.abs(tx.cantidad)

      // Revert: subtract previous change
      await Product.findOneAndUpdate({ _id: tx.productoId }, { $inc: { stock: -change } })
    }

    res.json({ message: "Transacción eliminada" })
  } catch (error) {
    console.error("Error eliminando transacción:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

export default router
