import express from "express"
import { body, validationResult } from "express-validator"
import { authMiddleware } from "../middleware/auth.js"
import Product from "../models/Product.js"

const router = express.Router()

// Listar productos con filtros opcionales
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { categoria, search, lowStock } = req.query
    const filter = { user: req.user._id }

    if (categoria) {
      filter.categoria = categoria
    }

    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { codigo: { $regex: search, $options: "i" } },
      ]
    }

    if (lowStock === "true") {
      // Comparar dos campos del documento: stock <= stockMinimo
      // Usamos $expr para poder comparar campos entre sí.
      filter.$expr = { $lte: ["$stock", "$stockMinimo"] }
    }

    const products = await Product.find(filter).sort({ nombre: 1 })
    res.json(products)
  } catch (error) {
    console.error("Error listando productos:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Obtener un producto
// Listar categorías únicas del usuario
router.get("/categories/list", authMiddleware, async (req, res) => {
  try {
    const categories = await Product.distinct("categoria", { user: req.user._id })
    res.json(categories)
  } catch (error) {
    console.error("Error listando categorías:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Obtener un producto
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id })
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    res.json(product)
  } catch (error) {
    console.error("Error obteniendo producto:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Crear producto
router.post(
  "/",
  authMiddleware,
  [
    body("nombre").notEmpty().withMessage("El nombre es requerido"),
    body("precio").isFloat({ min: 0 }).withMessage("El precio debe ser un número positivo"),
    body("categoria").notEmpty().withMessage("La categoría es requerida"),
    body("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un número entero positivo"),
    body("stockMinimo").optional().isInt({ min: 0 }).withMessage("El stock mínimo debe ser un número entero positivo"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const product = new Product({
        ...req.body,
        user: req.user._id,
      })

      await product.save()
      res.status(201).json(product)
    } catch (error) {
      console.error("Error creando producto:", error)
      res.status(500).json({ message: "Error del servidor" })
    }
  }
)

// Actualizar producto
router.put(
  "/:id",
  authMiddleware,
  [
    body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacío"),
    body("precio").optional().isFloat({ min: 0 }).withMessage("El precio debe ser un número positivo"),
    body("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un número entero positivo"),
    body("stockMinimo").optional().isInt({ min: 0 }).withMessage("El stock mínimo debe ser un número entero positivo"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const product = await Product.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true }
      )

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      res.json(product)
    } catch (error) {
      console.error("Error actualizando producto:", error)
      res.status(500).json({ message: "Error del servidor" })
    }
  }
)

// Eliminar producto
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    res.json({ message: "Producto eliminado" })
  } catch (error) {
    console.error("Error eliminando producto:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Listar categorías únicas del usuario
router.get("/categories/list", authMiddleware, async (req, res) => {
  try {
    const categories = await Product.distinct("categoria", { user: req.user._id })
    res.json(categories)
  } catch (error) {
    console.error("Error listando categorías:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Actualizar stock
router.post("/:id/stock", authMiddleware, async (req, res) => {
  try {
    const { cantidad, tipo } = req.body
    if (!cantidad || !["entrada", "salida"].includes(tipo)) {
      return res.status(400).json({ message: "Cantidad y tipo (entrada/salida) son requeridos" })
    }

    const product = await Product.findOne({ _id: req.params.id, user: req.user._id })
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    const newStock = tipo === "entrada" 
      ? product.stock + Number(cantidad)
      : product.stock - Number(cantidad)

    if (newStock < 0) {
      return res.status(400).json({ message: "Stock insuficiente" })
    }

    product.stock = newStock
    await product.save()

    res.json(product)
  } catch (error) {
    console.error("Error actualizando stock:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

export default router