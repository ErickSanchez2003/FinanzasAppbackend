import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import User from "../models/User.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Registro de usuario
router.post(
  "/register",
  [
    body("nombre").notEmpty().withMessage("El nombre es requerido"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("nombreEmpresa").notEmpty().withMessage("El nombre de la empresa es requerido"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { nombre, email, password, nombreEmpresa, telefono, rol } = req.body

      // Verificar si el usuario ya existe
      let user = await User.findOne({ email })
      if (user) {
        return res.status(400).json({ message: "El usuario ya existe" })
      }

      // Hashear contraseña
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Crear nuevo usuario
      user = new User({
        nombre,
        email,
        password: hashedPassword,
        nombreEmpresa,
        telefono,
        rol: rol || "dueño",
      })

      await user.save()

      // Crear token JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.status(201).json({
        token,
        user: {
          id: user._id,
          nombre: user.nombre,
          email: user.email,
          nombreEmpresa: user.nombreEmpresa,
          rol: user.rol,
        },
      })
    } catch (error) {
      console.error("Error en registro:", error)
      res.status(500).json({ message: "Error del servidor" })
    }
  },
)

// Login de usuario
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Verificar si el usuario existe
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: "Credenciales inválidas" })
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: "Credenciales inválidas" })
      }

      // Crear token JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.json({
        token,
        user: {
          id: user._id,
          nombre: user.nombre,
          email: user.email,
          nombreEmpresa: user.nombreEmpresa,
          rol: user.rol,
        },
      })
    } catch (error) {
      console.error("Error en login:", error)
      res.status(500).json({ message: "Error del servidor" })
    }
  },
)

// Obtener usuario actual
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        nombre: req.user.nombre,
        email: req.user.email,
        nombreEmpresa: req.user.nombreEmpresa,
        rol: req.user.rol,
        telefono: req.user.telefono,
      },
    })
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

export default router
