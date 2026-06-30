# 🏗️ Estructura del Proyecto PlomApp Backend

**Versión:** 2.0 (Refactorizada)  
**Actualización:** 2026-06-29

---

## 📂 Árbol de Directorios

```
backend_flask/
├── 📦 app/                          # Aplicación principal
│   ├── __init__.py                  # Factory de Flask
│   │
│   ├── 🔧 config/
│   │   └── __init__.py              # Configuraciones (dev, prod, test)
│   │
│   ├── 🗄️ database/
│   │   ├── __init__.py
│   │   ├── extensions.py            # Inicialización de extensiones (db, jwt, cors)
│   │   └── models.py                # 5 modelos SQLAlchemy
│   │
│   ├── 🎮 controllers/
│   │   ├── __init__.py
│   │   └── auth_controller.py       # Lógica de autenticación
│   │
│   ├── 🛣️ routes/                   # Blueprints (6 módulos)
│   │   ├── __init__.py
│   │   ├── auth.py                  # 6 endpoints
│   │   ├── services.py              # 2 endpoints
│   │   ├── technicians.py           # 6 endpoints
│   │   ├── appointments.py          # 4 endpoints
│   │   ├── admin.py                 # 5 endpoints
│   │   └── health.py                # 1 endpoint
│   │
│   ├── 🔌 middlewares/
│   │   ├── __init__.py
│   │   └── error_handler.py         # Manejadores de errores
│   │
│   ├── ⚙️ services/
│   │   ├── __init__.py
│   │   └── appointment_service.py   # Lógica de negocios
│   │
│   └── 🔧 utils/
│       ├── __init__.py
│       ├── decorators.py            # 4 decoradores (JWT, roles)
│       ├── validators.py            # 7 funciones de validación
│       └── jwt_utils.py             # Utilidades de JWT
│
├── 📝 run.py                        # Punto de entrada
├── 📋 requirements.txt              # Dependencias
├── 📄 .env.example                  # Plantilla de variables
├── 📄 .gitignore
│
└── 📚 DOCUMENTACIÓN
    ├── README.md
    ├── STRUCTURE.md                 # Este archivo
    ├── BACKEND_DESIGN.md
    ├── QUICK_REFERENCE.md
    ├── ARCHITECTURE_FLOWS.md
    └── INSTALL_QUICK.md
```

---

## 🎯 Descripción de Carpetas

### **app/**
Contiene toda la lógica de la aplicación, organizada en módulos:

- **`__init__.py`** - Factory pattern para crear la aplicación Flask
  - Inicializa extensiones (db, jwt, cors, migrate)
  - Registra blueprints (6 módulos)
  - Registra manejadores de errores
  - Crea tablas de base de datos

### **app/config/**
Gestiona las configuraciones según el ambiente:

- **`__init__.py`** - Clases Config, DevelopmentConfig, ProductionConfig, TestingConfig
  - Cargas variables desde `.env`
  - Configura base de datos, JWT, DEBUG, etc.

### **app/database/**
Maneja la base de datos y extensiones:

- **`extensions.py`** - Inicializa:
  - `db` = SQLAlchemy para ORM
  - `jwt` = JWTManager para autenticación
  - `cors` = CORS para frontend
  - `migrate` = Alembic para migraciones

- **`models.py`** - 5 modelos SQLAlchemy:
  - `User` (customers, technicians, admins)
  - `TechnicianProfile` (especialidades, rating, horarios)
  - `Service` (servicios disponibles)
  - `Appointment` (citas programadas)
  - `Device` (rastreo de dispositivos)

### **app/controllers/**
Contiene la lógica de negocio para rutas específicas:

- **`auth_controller.py`** - Funciones para autenticación:
  - login, register, get_profile, update_profile, forgot_password

### **app/routes/**
Blueprints que definen los endpoints REST (6 módulos):

- **`auth.py`** - 6 endpoints `/api/auth/*`
- **`services.py`** - 2 endpoints `/api/services`
- **`technicians.py`** - 6 endpoints `/api/technicians`
- **`appointments.py`** - 4 endpoints `/api/appointments`
- **`admin.py`** - 5 endpoints `/api/admin`
- **`health.py`** - 1 endpoint `/api/health`

**Total: 24 endpoints**

### **app/middlewares/**
Manejadores y middleware de la aplicación:

- **`error_handler.py`** - Registra manejadores globales:
  - 400, 401, 403, 404, 500

### **app/services/**
Lógica de negocio reutilizable:

- **`appointment_service.py`** - Funciones:
  - `find_available_technician()` - Busca técnico disponible
  - `get_available_time_slots()` - Obtiene slots libres
  - `validate_appointment_transition()` - Valida cambios de estado

### **app/utils/**
Utilidades compartidas:

- **`decorators.py`** - 4 decoradores:
  - `@jwt_required_custom` - Valida JWT y estado activo
  - `@admin_only` - Solo admin
  - `@technician_only` - Solo técnico
  - `@customer_only` - Solo cliente

- **`validators.py`** - 7 funciones de validación:
  - email, password, phone, name, date/time, role, status

- **`jwt_utils.py`** - Utilidades de token:
  - `generate_token()` - Crea JWT
  - `get_current_user_id()` - Extrae user_id

---

## 🔄 Flujo de la Aplicación

```
run.py (punto de entrada)
    ↓
app/__init__.py (factory)
    ├─→ Carga config según FLASK_ENV
    ├─→ Inicializa extensiones (db, jwt, cors)
    ├─→ Registra blueprints
    ├─→ Registra error handlers
    └─→ Crea tablas de BD
```

---

## 📊 Estadísticas

| Componente | Líneas | Archivos |
|------------|--------|----------|
| Controllers | 70 | 1 |
| Models | 310 | 1 |
| Routes | 650 | 6 |
| Services | 70 | 1 |
| Utils | 150 | 3 |
| Middlewares | 30 | 1 |
| Config | 49 | 1 |
| **TOTAL** | **~1,330** | **14** |

---

## 🚀 Cómo Ejecutar

### 1. Setup Inicial
```bash
# Copiar variables de entorno
cp .env.example .env

# Crear entorno virtual
python -m venv venv
.\venv\Scripts\Activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar Base de Datos
```bash
# MySQL
mysql -u root -p
CREATE DATABASE plomapp;
CREATE USER 'plomapp_user'@'localhost' IDENTIFIED BY 'plomapp_password_123';
GRANT ALL PRIVILEGES ON plomapp.* TO 'plomapp_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Migrar Base de Datos
```bash
# Primera vez
flask db init

# Crear migración
flask db migrate -m "Initial migration"

# Aplicar
flask db upgrade
```

### 4. Ejecutar Servidor
```bash
python run.py
# O con Flask
flask run --port 5000
```

**Servidor en:** `http://localhost:5000`

---

## 🔍 Importes Principales

### En **app/__init__.py**:
```python
from app.config import config_by_name
from app.database.extensions import db, jwt, cors, migrate
from app.routes.auth import auth_bp
from app.routes.services import services_bp
# ... etc
```

### En **routes/** (ejemplo):
```python
from flask import Blueprint, jsonify, request
from app.database.models import User, Appointment
from app.database.extensions import db
from app.utils.decorators import jwt_required_custom
from app.services.appointment_service import find_available_technician
```

### En **models.py**:
```python
from app.database.extensions import db
```

---

## 🎨 Patrones de Diseño

### **Factory Pattern**
La aplicación se crea con `create_app(env)` en `app/__init__.py`

### **Blueprint Pattern**
Cada módulo de rutas es un Blueprint registrado en la aplicación

### **Decorator Pattern**
Decoradores reutilizables para autenticación y autorización

### **Service Layer Pattern**
Lógica de negocio en `services/` separada de rutas

### **Controller Pattern**
Funciones de lógica en `controllers/` reutilizadas en rutas

---

## 🔐 Seguridad Implementada

✅ **Autenticación**
- JWT tokens con expiración configurable
- Password hashing con bcrypt (12 rounds)
- Verificación de estado de usuario activo

✅ **Autorización**
- Decoradores para roles (admin, technician, customer)
- Validaciones de permisos en cada endpoint
- Control de acceso basado en roles (RBAC)

✅ **Validación**
- Validadores centralizados en `utils/validators.py`
- Validación de entrada en todos los endpoints
- Validación de transiciones de estado

✅ **Base de Datos**
- SQLAlchemy ORM (protección contra SQL injection)
- Índices en búsquedas frecuentes
- Relaciones bien definidas

---

## 📦 Dependencias Principales

| Paquete | Versión | Uso |
|---------|---------|-----|
| Flask | 2.3.0 | Framework web |
| Flask-SQLAlchemy | 3.0.0 | ORM |
| Flask-JWT-Extended | 4.4.0 | Autenticación JWT |
| Flask-CORS | 3.0.10 | CORS |
| Flask-Migrate | 4.0.0 | Migraciones BD |
| bcrypt | 4.0.1 | Hash de contraseñas |
| PyMySQL | 1.1.0 | Driver MySQL |
| python-dotenv | 1.0.0 | Variables de entorno |

---

## 🗂️ Comparación: Estructura Anterior vs Nueva

### **Antes (app.py en raíz):**
```
backend_flask/
├── app.py ❌ (todo mezclado)
├── config.py
├── extensions.py
├── models.py
├── routes/
│   ├── auth.py
│   └── ...
└── utils/
```

### **Ahora (Modular y Escalable):**
```
backend_flask/
├── run.py ✅ (punto de entrada limpio)
├── app/
│   ├── __init__.py
│   ├── config/
│   ├── database/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   └── utils/
```

**Ventajas:**
- ✅ Mejor organización
- ✅ Más escalable
- ✅ Fácil de mantener
- ✅ Separación de responsabilidades
- ✅ Reutilización de código

---

## 🎯 Próximos Pasos

1. **Setup MySQL** - Crear BD y usuario
2. **Instalar dependencias** - `pip install -r requirements.txt`
3. **Migrar BD** - `flask db upgrade`
4. **Ejecutar servidor** - `python run.py`
5. **Probar endpoints** - `curl http://localhost:5000/api/health`
6. **Integrar frontend** - Conectar React/Vite

---

## 📞 Soporte

- 📖 Leer `INSTALL_QUICK.md` para instalación
- 📋 Consultar `QUICK_REFERENCE.md` para endpoints
- 🏗️ Ver `BACKEND_DESIGN.md` para especificaciones técnicas
- 🔄 Revisar `ARCHITECTURE_FLOWS.md` para flujos

---

**Backend completamente estructurado, modular y listo para producción** ✨
