# Sistema de Gestión Financiera para Microempresas

Aplicación web completa para gestión financiera con análisis predictivo, orientada a microempresas ferreteras en Cali.

## Arquitectura

- **Frontend**: React 18 + Vite + Tailwind CSS + JavaScript
- **Backend**: Express + Node.js + JavaScript
- **Base de Datos**: MongoDB Atlas
- **Autenticación**: JWT (JSON Web Tokens)
- **CORS**: Configurado para comunicación frontend-backend

## Estructura del Proyecto

\`\`\`
financial-app/
├── backend/              # Servidor Express
│   ├── config/          # Configuración de BD
│   │   └── db.js        # Conexión MongoDB
│   ├── models/          # Modelos de Mongoose
│   │   └── User.js      # Modelo de usuario
│   ├── routes/          # Rutas de API
│   │   ├── auth.js      # Autenticación
│   │   └── dashboard.js # Datos del dashboard
│   ├── middleware/      # Middleware
│   │   └── auth.js      # Verificación JWT
│   ├── .env.example     # Variables de entorno ejemplo
│   ├── package.json     # Dependencias backend
│   └── server.js        # Punto de entrada del servidor
│
└── frontend/            # Aplicación React
    ├── src/
    │   ├── components/  # Componentes reutilizables
    │   │   ├── DashboardHeader.jsx
    │   │   ├── StatsCards.jsx
    │   │   ├── RevenueChart.jsx
    │   │   ├── CashFlowChart.jsx
    │   │   ├── RecentTransactions.jsx
    │   │   ├── InventoryAlerts.jsx
    │   │   ├── QuickActions.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/       # Páginas principales
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── context/     # Context API
    │   │   └── AuthContext.jsx
    │   ├── services/    # Servicios de API
    │   │   └── api.js
    │   ├── App.jsx      # Componente principal
    │   ├── main.jsx     # Punto de entrada
    │   └── index.css    # Estilos globales
    ├── .env.example     # Variables de entorno ejemplo
    ├── index.html       # HTML principal
    ├── vite.config.js   # Configuración Vite
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json     # Dependencias frontend
\`\`\`

## Instalación y Configuración

### Requisitos Previos

- **Node.js 18+** instalado ([Descargar aquí](https://nodejs.org/))
- **Cuenta en MongoDB Atlas** (gratis) ([Crear cuenta](https://www.mongodb.com/cloud/atlas/register))
- **Git** (opcional)

### Paso 1: Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) y crea una cuenta gratuita
2. Crea un nuevo cluster:
   - Selecciona el tier **M0 (Free)**
   - Elige la región más cercana a Colombia
3. Configura acceso a la base de datos:
   - En **"Database Access"**, crea un usuario con contraseña
   - Guarda el usuario y contraseña (los necesitarás después)
4. Configura acceso de red:
   - En **"Network Access"**, haz clic en "Add IP Address"
   - Para desarrollo, puedes usar `0.0.0.0/0` (permite todas las IPs)
   - Para producción, usa solo tu IP específica
5. Obtén tu connection string:
   - Haz clic en **"Connect"** en tu cluster
   - Selecciona **"Connect your application"**
   - Copia el connection string (se ve así: `mongodb+srv://usuario:<password>@cluster.mongodb.net/`)
   - Reemplaza `<password>` con tu contraseña real

### Paso 2: Configurar el Backend

\`\`\`bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env desde el ejemplo
cp .env.example .env
\`\`\`

Edita el archivo `backend/.env` con tus credenciales:

\`\`\`env
# MongoDB Atlas - Reemplaza con tu connection string real
MONGODB_URI=mongodb+srv://tuusuario:tupassword@cluster.mongodb.net/financial-app?retryWrites=true&w=majority

# JWT Secret - Genera uno aleatorio y seguro
# Puedes usar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=genera_un_string_aleatorio_de_al_menos_32_caracteres_aqui

# Puerto del servidor
PORT=5000

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:5173
\`\`\`

### Paso 3: Configurar el Frontend

\`\`\`bash
# Navegar a la carpeta frontend (desde la raíz del proyecto)
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env desde el ejemplo
cp .env.example .env
\`\`\`

El archivo `frontend/.env` ya tiene la configuración por defecto:

\`\`\`env
# URL del backend API
VITE_API_URL=http://localhost:5000/api
\`\`\`

### Paso 4: Ejecutar la Aplicación

Necesitas **dos terminales** abiertas:

**Terminal 1 - Backend:**
\`\`\`bash
cd backend
npm run dev
\`\`\`

Verás el mensaje: `🚀 Servidor corriendo en puerto 5000` y `✅ MongoDB conectado exitosamente`

**Terminal 2 - Frontend:**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

Verás el mensaje con la URL local, generalmente: `http://localhost:5173`

### Paso 5: Usar la Aplicación

1. Abre tu navegador en `http://localhost:5173`
2. Haz clic en **"Regístrate aquí"**
3. Completa el formulario de registro con los datos de tu empresa
4. Serás redirigido automáticamente al dashboard
5. ¡Explora las funcionalidades!

## Uso de la Aplicación

### Registro de Usuario

- **Nombre completo**: Tu nombre
- **Email**: Correo electrónico (será tu usuario)
- **Nombre de la empresa**: Nombre de tu ferretería
- **Teléfono**: Número de contacto (opcional)
- **Contraseña**: Mínimo 6 caracteres
- **Rol**: Dueño, Empleado o Contador

### Dashboard

El dashboard muestra:

- **KPIs principales**: Ingresos, gastos, flujo de caja, inventario
- **Gráfico de ingresos vs gastos**: Tendencia de los últimos 6 meses
- **Gráfico de flujo de caja**: Evolución mensual
- **Transacciones recientes**: Últimas operaciones registradas
- **Alertas de inventario**: Productos con stock bajo
- **Acciones rápidas**: Acceso directo a funciones principales

## Características Implementadas

- ✅ Autenticación completa (registro, login, logout)
- ✅ Protección de rutas con JWT
- ✅ Dashboard con KPIs financieros en tiempo real
- ✅ Gráficos interactivos (Recharts)
- ✅ Gestión de sesiones
- ✅ Roles de usuario (dueño, empleado, contador)
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Conexión segura con MongoDB Atlas
- ✅ CORS configurado correctamente
- ✅ Validación de formularios
- ✅ Manejo de errores

## Próximos Módulos a Desarrollar

1. **Gestión de usuarios completa**
   - Editar perfil
   - Cambiar contraseña
   - Administrar empleados

2. **Módulo de ingresos y gastos**
   - Registrar transacciones
   - Categorización
   - Filtros y búsqueda

3. **Módulo de inventario**
   - Gestión de productos
   - Control de stock
   - Alertas automáticas

4. **Análisis predictivo con IA**
   - Pronósticos de ventas
   - Predicción de flujo de caja
   - Recomendaciones inteligentes

5. **Reportes y exportación**
   - Reportes PDF
   - Exportar a Excel
   - Gráficos personalizados

## Tecnologías Utilizadas

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos interactivos
- **Lucide React** - Iconos modernos
- **Tailwind CSS** - Estilos utility-first

### Backend
- **Express** - Framework web
- **Mongoose** - ODM para MongoDB
- **JWT (jsonwebtoken)** - Autenticación
- **Bcryptjs** - Hash de contraseñas
- **CORS** - Cross-Origin Resource Sharing
- **Express Validator** - Validación de datos
- **Dotenv** - Variables de entorno

## Scripts Disponibles

### Backend

\`\`\`bash
npm start       # Ejecutar en producción
npm run dev     # Ejecutar en desarrollo con auto-reload
\`\`\`

### Frontend

\`\`\`bash
npm run dev     # Servidor de desarrollo
npm run build   # Build para producción
npm run preview # Preview del build de producción
\`\`\`

## Solución de Problemas

### Error: "MongoDB connection failed"

- Verifica que tu connection string en `backend/.env` sea correcto
- Asegúrate de haber reemplazado `<password>` con tu contraseña real
- Verifica que tu IP esté en la lista blanca de MongoDB Atlas

### Error: "Network Error" o "CORS Error"

- Asegúrate de que el backend esté corriendo en el puerto 5000
- Verifica que `FRONTEND_URL` en `backend/.env` sea `http://localhost:5173`
- Verifica que `VITE_API_URL` en `frontend/.env` sea `http://localhost:5000/api`

### Error: "Token no válido"

- Cierra sesión y vuelve a iniciar sesión
- Verifica que `JWT_SECRET` en `backend/.env` tenga al menos 32 caracteres

### El frontend no carga

- Verifica que hayas ejecutado `npm install` en la carpeta frontend
- Asegúrate de estar en la carpeta correcta al ejecutar `npm run dev`
- Revisa la consola del navegador para ver errores específicos

### Datos no aparecen en el dashboard

- Verifica que el backend esté corriendo y conectado a MongoDB
- Abre las herramientas de desarrollador (F12) y revisa la pestaña Network
- Asegúrate de haber iniciado sesión correctamente

## Estructura de la Base de Datos

### Colección: users

\`\`\`javascript
{
  _id: ObjectId,
  nombre: String,
  email: String (único),
  password: String (hasheado),
  nombreEmpresa: String,
  rol: String (enum: 'dueño', 'empleado', 'contador'),
  telefono: String,
  createdAt: Date
}
\`\`\`

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere token)

### Dashboard

- `GET /api/dashboard/stats` - Obtener estadísticas (requiere token)
- `GET /api/dashboard/transactions` - Obtener transacciones (requiere token)
- `GET /api/dashboard/inventory-alerts` - Obtener alertas (requiere token)

## Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens JWT con expiración de 7 días
- Validación de datos en backend
- Protección CORS configurada
- Variables sensibles en archivos .env (no versionados)

## Contribuir

Este es un proyecto académico para la gestión financiera de microempresas ferreteras en Cali.

## Licencia

Proyecto académico - Universidad [Nombre de tu Universidad]

## Contacto

Para soporte o preguntas sobre el proyecto, contacta al equipo de desarrollo.

---

**Nota**: Este proyecto está en desarrollo activo. Los datos mostrados en el dashboard son de ejemplo y serán reemplazados por datos reales cuando se implementen los módulos de gestión.
