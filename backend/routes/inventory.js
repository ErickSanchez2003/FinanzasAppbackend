import express from "express"
import { body, validationResult } from "express-validator"
import { authMiddleware } from "../middleware/auth.js"
import Movement from "../models/Movement.js"
import Product from "../models/Product.js"

const router = express.Router()

// Listar movimientos (filtros: productoId, tipo, start, end)
router.get("/movements", authMiddleware, async (req, res) => {
  try {
    const { productoId, tipo, start, end } = req.query
    const filter = { usuario: req.user._id }

    // si se pasa productoId queremos todas las movimientos del producto (no sólo del usuario que registró)
    if (productoId) filter.productoId = productoId
    if (tipo) filter.tipo = tipo
    if (start || end) filter.fecha = {}
    if (start) filter.fecha.$gte = new Date(start)
    if (end) filter.fecha.$lte = new Date(end)

    // Si no se filtra por producto, mostrar movimientos registrados por la empresa (usuario)
    const movements = await Movement.find(filter).populate("productoId usuario", "nombre stock nombreEmpresa email rol").sort({ fecha: -1 }).limit(1000)
    res.json(movements)
  } catch (error) {
    console.error("Error listando movimientos:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Crear movimiento
router.post(
  "/movements",
  authMiddleware,
  [
    body("tipo").isIn(["entrada", "salida", "transferencia", "ajuste"]).withMessage("Tipo inválido"),
    body("cantidad").isNumeric().withMessage("Cantidad inválida"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const { fecha, tipo, cantidad, productoId, productoNombre, observaciones, origen, destino, referencia } = req.body

  // Normalizar productoId: si viene cadena vacía o falsy, tratar como no provisto
  let prodId = productoId && String(productoId).trim() !== "" ? productoId : undefined

  // Si no se envía productoId pero sí productoNombre, buscar o crear el producto para este usuario
  if (!prodId && productoNombre && String(productoNombre).trim() !== "") {
    let prod = await Product.findOne({ nombre: productoNombre, user: req.user._id })
    if (!prod) {
      prod = new Product({ nombre: productoNombre, precio: 0, categoria: "Ferreteria", user: req.user._id })
      await prod.save()
    }
    prodId = prod._id
  }

      // Crear movimiento (usuario responsable)
      const movement = new Movement({
        fecha: fecha ? new Date(fecha) : Date.now(),
        tipo,
        cantidad: Number(cantidad),
        productoId: prodId,
        usuario: req.user._id,
        observaciones,
        origen,
        destino,
        referencia,
      })

      // Ajuste de stock atómico cuando aplica
      if (prodId) {
        const qty = Number(cantidad)

        if (tipo === "ajuste") {
          // Para ajuste guardamos el stock previo y seteamos el stock al valor absoluto indicado
          const product = await Product.findById(prodId)
          if (!product) return res.status(400).json({ message: "Producto no encontrado" })
          movement.previousStock = product.stock
          // Asegurar cantidad numérica no negativa
          const newStock = Number(qty)
          if (isNaN(newStock) || newStock < 0) return res.status(400).json({ message: "Cantidad inválida para ajuste" })
          await Product.findOneAndUpdate({ _id: prodId }, { $set: { stock: newStock } }, { new: true })
        } else {
          // Definir incremento: entrada = +qty, cualquier otro tipo = -qty
          const inc = tipo === "entrada" ? qty : -Math.abs(qty)

          if (inc < 0) {
            const updated = await Product.findOneAndUpdate({ _id: prodId, stock: { $gte: Math.abs(inc) } }, { $inc: { stock: inc } }, { new: true })
            if (!updated) return res.status(400).json({ message: "Stock insuficiente o producto no encontrado" })
          } else if (inc > 0) {
            await Product.findOneAndUpdate({ _id: prodId }, { $inc: { stock: inc } })
          }
        }
      }

      await movement.save()
      res.status(201).json(movement)
    } catch (error) {
      console.error("Error creando movimiento:", error)
      res.status(500).json({ message: "Error del servidor" })
    }
  },
)

// Obtener movimiento
router.get("/movements/:id", authMiddleware, async (req, res) => {
  try {
    const mv = await Movement.findById(req.params.id).populate("productoId usuario", "nombre stock nombreEmpresa email rol")
    if (!mv) return res.status(404).json({ message: "Movimiento no encontrado" })
    res.json(mv)
  } catch (error) {
    console.error("Error obteniendo movimiento:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Editar movimiento (solo rol 'dueño')
router.put("/movements/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== "dueño") return res.status(403).json({ message: "No autorizado" })

    const existing = await Movement.findById(req.params.id)
    if (!existing) return res.status(404).json({ message: "Movimiento no encontrado" })
    // Helper: get increment for a tipo and cantidad
    const getInc = (tipo, qty) => (tipo === "entrada" ? Number(qty) : -Math.abs(Number(qty)))

    // Revertir efecto anterior si afectó stock
    if (existing.productoId) {
      if (existing.tipo === "ajuste") {
        // Si fue un ajuste, restaurar el stock previo si está registrado
        if (typeof existing.previousStock === "number") {
          await Product.findOneAndUpdate({ _id: existing.productoId }, { $set: { stock: existing.previousStock } })
        }
      } else {
        const prevInc = getInc(existing.tipo, existing.cantidad)
        // revert = -prevInc
        const revert = -prevInc
        if (revert !== 0) {
          await Product.findOneAndUpdate({ _id: existing.productoId }, { $inc: { stock: revert } })
        }
      }
    }

    const updates = req.body
    // Normalizar productoId en updates y soportar productoNombre
    if (updates.productoId && String(updates.productoId).trim() === "") updates.productoId = undefined
    if (!updates.productoId && updates.productoNombre && String(updates.productoNombre).trim() !== "") {
      let prod = await Product.findOne({ nombre: updates.productoNombre, user: req.user._id })
      if (!prod) {
        prod = new Product({ nombre: updates.productoNombre, precio: 0, categoria: "Ferreteria", user: req.user._id })
        await prod.save()
      }
      updates.productoId = prod._id
    }

    // Aplicar nuevo efecto
    // Si el update implica productoNombre/productoId ya está normalizado en updates
    if (updates.productoId) {
      // Si el nuevo tipo es ajuste, registrar previousStock (valor actual) y setear
      if (updates.tipo === "ajuste") {
        const prod = await Product.findById(updates.productoId)
        if (!prod) return res.status(400).json({ message: "Producto no encontrado al aplicar ajuste" })
        const newStock = Number(updates.cantidad)
        if (isNaN(newStock) || newStock < 0) return res.status(400).json({ message: "Cantidad inválida para ajuste" })
        updates.previousStock = prod.stock
        await Product.findOneAndUpdate({ _id: updates.productoId }, { $set: { stock: newStock } }, { new: true })
      } else {
        // Para otros tipos usar inc logic
        const inc = getInc(updates.tipo, updates.cantidad)
        if (inc < 0) {
          const ok = await Product.findOneAndUpdate({ _id: updates.productoId, stock: { $gte: Math.abs(inc) } }, { $inc: { stock: inc } }, { new: true })
          if (!ok) return res.status(400).json({ message: "Stock insuficiente al aplicar cambio" })
        } else if (inc > 0) {
          await Product.findOneAndUpdate({ _id: updates.productoId }, { $inc: { stock: inc } })
        }
      }
    }

    const updated = await Movement.findByIdAndUpdate(req.params.id, updates, { new: true })
    res.json(updated)
  } catch (error) {
    console.error("Error editando movimiento:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Eliminar movimiento (solo rol 'dueño')
router.delete("/movements/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== "dueño") return res.status(403).json({ message: "No autorizado" })

    const mv = await Movement.findByIdAndDelete(req.params.id)
    if (!mv) return res.status(404).json({ message: "Movimiento no encontrado" })

    // Revertir efecto si aplica
    if (mv.productoId) {
      if (mv.tipo === "ajuste") {
        // Restaurar stock previo si existe
        if (typeof mv.previousStock === "number") {
          await Product.findOneAndUpdate({ _id: mv.productoId }, { $set: { stock: mv.previousStock } })
        }
      } else {
        const getInc = (tipo, qty) => (tipo === "entrada" ? Number(qty) : -Math.abs(Number(qty)))
        const prevInc = getInc(mv.tipo, mv.cantidad)
        const revert = -prevInc
        if (revert !== 0) {
          await Product.findOneAndUpdate({ _id: mv.productoId }, { $inc: { stock: revert } })
        }
      }
    }

    res.json({ message: "Movimiento eliminado" })
  } catch (error) {
    console.error("Error eliminando movimiento:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Alerts: productos con stock bajo
router.get("/alerts/low-stock", authMiddleware, async (req, res) => {
  try {
    const low = await Product.find({ user: req.user._id, $expr: { $lte: ["$stock", "$stockMinimo"] } }).sort({ stock: 1 })
    res.json(low)
  } catch (error) {
    console.error("Error obteniendo alertas:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

export default router
