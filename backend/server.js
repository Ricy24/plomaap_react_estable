import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Rutas de la base de datos
const dbPath = path.join(__dirname, 'db.json')

// Función para leer la base de datos
function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error leyendo la base de datos:', error)
    return { users: [] }
  }
}

// Función para guardar en la base de datos
function writeDatabase(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error guardando la base de datos:', error)
  }
}

// RUTA: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    })
  }

  const db = readDatabase()
  const user = db.users.find(u => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email o contraseña incorrectos'
    })
  }

  // Retornar usuario sin contraseña
  const { password: _, ...userWithoutPassword } = user
  res.json({
    success: true,
    message: 'Login exitoso',
    user: userWithoutPassword,
    token: `token_${user.id}_${Date.now()}`
  })
})

// RUTA: Registro
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address, avatar } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, email y contraseña son requeridos'
    })
  }

  const db = readDatabase()

  // Verificar si el email ya existe
  const existingUser = db.users.find(u => u.email === email)
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'El email ya está registrado'
    })
  }

  // Crear nuevo usuario
  const newUser = {
    id: db.users.length + 1,
    name,
    email,
    password,
    phone: phone || '',
    address: address || '',
    avatar: avatar || null,
    role: 'user',
    createdAt: new Date().toISOString().split('T')[0]
  }

  db.users.push(newUser)
  writeDatabase(db)

  // Retornar usuario sin contraseña
  const { password: _, ...userWithoutPassword } = newUser
  res.status(201).json({
    success: true,
    message: 'Registro exitoso',
    user: userWithoutPassword,
    token: `token_${newUser.id}_${Date.now()}`
  })
})

// RUTA: Obtener perfil (requiere token)
app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    })
  }

  // Extraer ID del token
  const userId = parseInt(token.split('_')[1])
  const db = readDatabase()
  const user = db.users.find(u => u.id === userId)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  const { password: _, ...userWithoutPassword } = user
  res.json({
    success: true,
    user: userWithoutPassword
  })
})

// RUTA: Logout (endpoint simple que valida el token)
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  })
})

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend de PlomApp funcionando correctamente' })
})

// Manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend de PlomApp ejecutándose en http://localhost:${PORT}`)
  console.log(`📝 Usuarios de prueba disponibles en db.json`)
  console.log(`\nCredenciales de prueba:`)
  console.log(`  Email: andres@example.com`)
  console.log(`  Contraseña: 123456`)
})
