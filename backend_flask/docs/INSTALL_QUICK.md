# PlomApp Backend - Guía de Instalación Rápida

## ✅ Backend Completamente Implementado

El backend Flask está 100% construido y listo para ejecutarse.

## 📋 Prerrequisitos

- Python 3.8+
- MySQL 5.7+ o MariaDB
- pip
- Git (opcional)

## Instalación Paso a Paso (Windows PowerShell)

### 1. Preparar Base de Datos

**Opción A: MySQL Workbench (Recomendado)**

1. Abrir MySQL Workbench
2. Conectar a localhost
3. Ejecutar este script en una nueva query:

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS plomapp 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'plomapp_user'@'localhost' IDENTIFIED BY 'plomapp_password_123';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON plomapp.* TO 'plomapp_user'@'localhost';
FLUSH PRIVILEGES;

-- Seleccionar base de datos
USE plomapp;
```

**Opción B: MySQL CLI**

```bash
mysql -u root -p
```

Luego ejecutar el script anterior.

### 2. Verificar MySQL está corriendo

```powershell
# Probar conexión
mysql -u plomapp_user -p plomapp_password_123 -h localhost -P 3306

# Si pide contraseña, ingresar: plomapp_password_123
```

### 3. Configurar Variables de Entorno

```powershell
# Navegar a la carpeta del backend
cd c:\Users\Anrid\backend_flask

# Crear archivo .env
Copy-Item .env.example .env

# Abrir .env con editor
notepad .env
```

**Contenido de .env:**

```env
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
MYSQL_USER=plomapp_user
MYSQL_PASSWORD=plomapp_password_123
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=plomapp
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
DEBUG=True
```

### 4. Crear Entorno Virtual e Instalar Dependencias

```powershell
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Si hay problema de permisos, ejecutar:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Instalar dependencias
pip install -r requirements.txt
```

### 5. Inicializar Base de Datos (Migraciones)

```powershell
# Inicializar migraciones (primera vez)
flask db init

# Crear migración inicial
flask db migrate -m "Initial migration"

# Aplicar migraciones a la base de datos
flask db upgrade
```

### 6. Ejecutar el Servidor

```powershell
# Opción 1: Ejecutar directamente
python app.py

# Opción 2: Usar flask
flask run --port 5000

# Si todo va bien, deberías ver:
# WARNING in flask.app: This is a development server. Do not use it in production.
# Running on http://127.0.0.1:5000
```

El servidor está corriendo en `http://localhost:5000`

## 🧪 Pruebas Iniciales

### Verificar Salud del Servidor

```powershell
# En otra terminal (con venv activado)
curl http://localhost:5000/api/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2026-06-29T...",
  "database": "connected"
}
```

### Registrar Nuevo Usuario (Cliente)

```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "role": "customer"
  }'
```

Guardar el `token` de la respuesta.

### Registrar Técnico

```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "technician@example.com",
    "password": "password123",
    "name": "Carlos García",
    "phone": "+0987654321",
    "role": "technician"
  }'
```

### Crear Servicio (Admin)

Primero, registrar admin:

```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User",
    "role": "customer"
  }'
```

Luego usar MySQL Workbench para actualizar el rol a admin:

```sql
USE plomapp;
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Luego insertar servicios:

```sql
INSERT INTO services (name, icon, color, base_price, description) VALUES
('Reparación de Tuberías', '🔧', '#FF5733', 50.00, 'Reparación general de tuberías'),
('Instalación de Accesorios', '🔨', '#33FF57', 100.00, 'Instalación de grifos y accesorios'),
('Limpieza de Desagüe', '💧', '#3357FF', 75.00, 'Limpieza profesional de desagües');
```

### Obtener Servicios

```powershell
curl http://localhost:5000/api/services
```

### Obtener Citas (con autenticación)

```powershell
$token = "tu_token_aqui"
curl -X GET http://localhost:5000/api/appointments `
  -H "Authorization: Bearer $token"
```

## 📁 Estructura de Archivos Creados

```
backend_flask/
├── app.py                    # ✅ Aplicación principal
├── config.py                 # ✅ Configuración
├── extensions.py             # ✅ Extensiones (db, jwt, cors)
├── models.py                 # ✅ Modelos SQLAlchemy
├── requirements.txt          # ✅ Dependencias
├── .env                      # Crear manualmente
├── .env.example              # ✅ Plantilla
├── .gitignore                # ✅ Git ignore
├── routes/
│   ├── __init__.py           # ✅
│   ├── auth.py               # ✅ Autenticación
│   ├── services.py           # ✅ Servicios
│   ├── technicians.py        # ✅ Técnicos
│   ├── appointments.py       # ✅ Citas
│   ├── admin.py              # ✅ Administración
│   └── health.py             # ✅ Salud
├── utils/
│   ├── __init__.py           # ✅
│   ├── decorators.py         # ✅ Decoradores JWT
│   ├── validators.py         # ✅ Validadores
│   └── jwt_utils.py          # ✅ Utilidades JWT
├── migrations/               # Auto-generado por Flask-Migrate
│   └── versions/
└── DOCUMENTACIÓN
    ├── BACKEND_DESIGN.md     # Especificación completa
    ├── QUICK_REFERENCE.md    # Referencia rápida
    ├── ARCHITECTURE_FLOWS.md # Flujos y diagramas
    ├── IMPLEMENTATION_SKELETON.md # Esquemas de código
    └── INSTALL_QUICK.md      # Este archivo
```

## 🔧 Troubleshooting

### Error: "No module named 'mysql'"

```powershell
pip install PyMySQL
```

### Error: "Access denied for user 'plomapp_user'"

```powershell
# Verificar que MySQL está corriendo
# Verificar credenciales en .env
# Recrear usuario en MySQL:

mysql -u root -p
# Luego:
DROP USER 'plomapp_user'@'localhost';
CREATE USER 'plomapp_user'@'localhost' IDENTIFIED BY 'plomapp_password_123';
GRANT ALL PRIVILEGES ON plomapp.* TO 'plomapp_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Address already in use"

El puerto 5000 ya está en uso. Cambiar puerto:

```powershell
flask run --port 5001
```

### Base de datos vacía

Ejecutar migraciones:

```powershell
flask db upgrade
```

### JWT Token inválido

- Verificar que el token está completo (no cortado)
- Incluir "Bearer " antes del token
- Verificar que JWT_SECRET_KEY es el mismo en app y cliente

## 📞 Endpoints Disponibles (25 Total)

```
AUTH:
  POST   /api/auth/login
  POST   /api/auth/register
  POST   /api/auth/forgot-password
  GET    /api/auth/profile
  PATCH  /api/auth/profile
  POST   /api/auth/logout

SERVICES:
  GET    /api/services
  GET    /api/services/<id>

TECHNICIANS:
  GET    /api/technicians
  GET    /api/technicians/available
  GET    /api/technicians/slots
  GET    /api/technicians/profile
  GET    /api/technicians/appointments
  PATCH  /api/technicians/appointments/<id>

APPOINTMENTS:
  GET    /api/appointments
  GET    /api/appointments/<id>
  POST   /api/appointments
  PATCH  /api/appointments/<id>

ADMIN:
  GET    /api/admin/dashboard
  GET    /api/admin/users
  POST   /api/admin/users
  PATCH  /api/admin/users/<id>
  PATCH  /api/admin/appointments/<id>

HEALTH:
  GET    /api/health
```

## 🎯 Próximos Pasos

1. ✅ Instalar dependencias: `pip install -r requirements.txt`
2. ✅ Configurar .env con credenciales MySQL
3. ✅ Crear base de datos y usuario
4. ✅ Ejecutar migraciones: `flask db upgrade`
5. ✅ Iniciar servidor: `python app.py`
6. ✅ Integrar con frontend React/Vite

## 📚 Documentación Completa

- **BACKEND_DESIGN.md** - Especificación exhaustiva (2000+ líneas)
- **QUICK_REFERENCE.md** - Referencia rápida de endpoints
- **ARCHITECTURE_FLOWS.md** - Diagramas visuales
- **README.md** - Descripción general

---

**Backend Flask completamente implementado y listo para usar.**

¿Preguntas? Consulta los archivos de documentación o revisa los logs del servidor.
