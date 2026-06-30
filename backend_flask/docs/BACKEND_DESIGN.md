# PlomApp Backend - Especificación de Diseño

**Aplicación:** PlomApp (Sistema de gestión de citas para servicios de plomería)  
**Framework:** Flask con SQLAlchemy y MySQL  
**Versión:** 1.0  
**Fecha:** 2026-06-29

---

## 1. Visión General

El backend de PlomApp es una API REST construida con Flask que proporciona autenticación, gestión de usuarios, servicios, técnicos, citas y administración. Está diseñado para consumir desde un frontend React/Vite en `http://localhost:3000` (o similar) y ejecutarse en `http://localhost:5000`.

**Principios clave:**
- Seguridad: Autenticación con JWT, cifrado de contraseñas con bcrypt, validación de roles
- Compatibilidad: Mantiene la misma API que el frontend actual espera
- Escalabilidad: Estructura modular con blueprints para fácil mantenimiento
- MySQL: Base de datos relacional con migraciones versionadas

---

## 2. Estructura del Proyecto

```
backend_flask/
├── .env                      # Variables de entorno (NO versionado)
├── .gitignore                # Excepciones de Git
├── .env.example              # Plantilla de variables de entorno
├── README.md                 # Instrucciones de instalación y uso
├── requirements.txt          # Dependencias Python
├── config.py                 # Configuración centralizada
├── extensions.py             # Inicialización de extensiones (db, jwt, cors)
├── app.py                    # Aplicación principal de Flask
├── models.py                 # Modelos SQLAlchemy
├── utils/
│   ├── __init__.py
│   ├── jwt_utils.py         # Funciones auxiliares para JWT
│   ├── password_utils.py    # Funciones para hash de contraseñas
│   ├── validators.py        # Validadores de entrada (email, teléfono, etc.)
│   └── decorators.py        # Decoradores personalizados (jwt_required, admin_only, etc.)
├── routes/                   # Blueprints/rutas
│   ├── __init__.py
│   ├── auth.py              # POST /api/auth/*
│   ├── services.py          # GET /api/services
│   ├── technicians.py       # GET /api/technicians, POST, PATCH
│   ├── appointments.py      # CRUD de citas
│   ├── admin.py             # Rutas administrativas
│   └── health.py            # GET /api/health
├── migrations/              # Migraciones de base de datos (Alembic)
│   ├── versions/
│   ├── env.py
│   ├── script.py.mako
│   └── alembic.ini
└── tests/                   # (Opcional) Tests unitarios y de integración
    ├── __init__.py
    ├── test_auth.py
    ├── test_appointments.py
    └── conftest.py
```

---

## 3. Configuración de Entorno

### 3.1 Variables de `.env`

```env
# Flask
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=your-secret-key-change-in-production

# MySQL
MYSQL_USER=plomapp_user
MYSQL_PASSWORD=strong_password_here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=plomapp

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
DEBUG=True
```

### 3.2 Plantilla `.env.example`

```env
# Flask
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=change-me-in-production

# MySQL
MYSQL_USER=plomapp_user
MYSQL_PASSWORD=change-me-in-production
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=plomapp

# JWT
JWT_SECRET_KEY=change-me-in-production
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
DEBUG=False
```

---

## 4. Modelos SQLAlchemy

### 4.1 Diagrama Entidad-Relación (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│ User                                                         │
├─────────────────┬──────────────────────────────────────────┤
│ id (PK)         │ int                                       │
│ name            │ varchar(255)                             │
│ email           │ varchar(255) UNIQUE                      │
│ password_hash   │ varchar(255)                             │
│ phone           │ varchar(20)                              │
│ address         │ text                                     │
│ avatar          │ varchar(500)                             │
│ role            │ ENUM('customer', 'technician', 'admin') │
│ status          │ ENUM('active', 'inactive', 'suspended') │
│ created_at      │ datetime DEFAULT NOW()                   │
│ updated_at      │ datetime DEFAULT NOW() ON UPDATE         │
└─────────────────┴──────────────────────────────────────────┘
         │
         ├─── 1:1 ──→ TechnicianProfile (si role = 'technician')
         ├─── 1:N ──→ Appointment (user_id)
         ├─── 1:N ──→ Device
         └─── 1:N ──→ TechnicianSchedule

┌─────────────────────────────────────────────────────────────┐
│ TechnicianProfile                                            │
├─────────────────┬──────────────────────────────────────────┤
│ id (PK)         │ int                                       │
│ user_id (FK)    │ int UNIQUE                               │
│ specialties     │ JSON (["plumbing", "gas", ...])          │
│ rating          │ float (0-5)                              │
│ bio             │ text                                     │
│ schedule        │ JSON {"mon": [...], "tue": [...]}        │
│ available       │ boolean                                  │
│ created_at      │ datetime                                 │
│ updated_at      │ datetime                                 │
└─────────────────┴──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Service                                                      │
├─────────────────┬──────────────────────────────────────────┤
│ id (PK)         │ int                                       │
│ name            │ varchar(255)                             │
│ icon            │ varchar(255)                             │
│ color           │ varchar(7)  # hex color                  │
│ base_price      │ decimal(10, 2)                           │
│ description     │ text                                     │
│ created_at      │ datetime                                 │
│ updated_at      │ datetime                                 │
└─────────────────┴──────────────────────────────────────────┘
         │
         └─── 1:N ──→ Appointment (service_id)

┌─────────────────────────────────────────────────────────────┐
│ Appointment                                                  │
├─────────────────┬──────────────────────────────────────────┤
│ id (PK)         │ int                                       │
│ user_id (FK)    │ int (customer)                           │
│ technician_id   │ int (FK to User) nullable                │
│ (FK)            │                                          │
│ service_id (FK) │ int                                       │
│ date            │ date                                     │
│ time            │ time                                     │
│ status          │ ENUM('pending', 'scheduled',             │
│                 │       'in_progress', 'completed',        │
│                 │       'cancelled')                       │
│ notes           │ text                                     │
│ created_at      │ datetime                                 │
│ updated_at      │ datetime                                 │
└─────────────────┴──────────────────────────────────────────┘
         │
         ├─→ User (user_id) - Customer
         ├─→ User (technician_id) - Technician
         └─→ Service (service_id)

┌─────────────────────────────────────────────────────────────┐
│ Device                                                       │
├─────────────────┬──────────────────────────────────────────┤
│ id (PK)         │ int                                       │
│ user_id (FK)    │ int                                       │
│ user_agent      │ text                                     │
│ registered_at   │ datetime                                 │
│ last_access     │ datetime                                 │
└─────────────────┴──────────────────────────────────────────┘
         │
         └─→ User (user_id)

┌─────────────────────────────────────────────────────────────┐
│ TechnicianSchedule                                           │
├─────────────────┬──────────────────────────────────────────┤
│ id (PK)         │ int                                       │
│ technician_id   │ int (FK)                                 │
│ (FK)            │                                          │
│ day_of_week     │ ENUM('mon', 'tue', 'wed', ...)           │
│ start_time      │ time                                     │
│ end_time        │ time                                     │
│ is_available    │ boolean                                  │
└─────────────────┴──────────────────────────────────────────┘
         │
         └─→ User (technician_id)
```

### 4.2 Definición de Modelos SQLAlchemy

#### User Model
```python
class User(db.Model):
    __tablename__ = 'users'
    
    # Columnas
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    avatar = db.Column(db.String(500))
    role = db.Column(db.Enum('customer', 'technician', 'admin'), 
                     default='customer', nullable=False)
    status = db.Column(db.Enum('active', 'inactive', 'suspended'), 
                       default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, 
                           onupdate=datetime.utcnow)
    
    # Relaciones
    technician_profile = db.relationship('TechnicianProfile', 
                                        uselist=False, 
                                        backref='user')
    appointments_as_customer = db.relationship('Appointment', 
                                              foreign_keys='Appointment.user_id',
                                              backref='customer')
    appointments_as_technician = db.relationship('Appointment', 
                                                foreign_keys='Appointment.technician_id',
                                                backref='technician')
    devices = db.relationship('Device', backref='user', cascade='all, delete-orphan')
    
    # Métodos
    def set_password(self, password: str) -> None:
        """Hashear y almacenar contraseña"""
    
    def verify_password(self, password: str) -> bool:
        """Verificar contraseña"""
    
    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Serializar a diccionario"""
    
    def has_role(self, role: str) -> bool:
        """Verificar si tiene un rol específico"""
    
    def is_active(self) -> bool:
        """Verificar si el usuario está activo"""
```

#### TechnicianProfile Model
```python
class TechnicianProfile(db.Model):
    __tablename__ = 'technician_profiles'
    
    # Columnas
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), 
                       unique=True, nullable=False)
    specialties = db.Column(db.JSON, default=[])  # ["plumbing", "gas", "heating"]
    rating = db.Column(db.Float, default=0.0)    # 0-5
    bio = db.Column(db.Text)
    schedule = db.Column(db.JSON)  # {"mon": [["08:00", "17:00"], ...], ...}
    available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, 
                          onupdate=datetime.utcnow)
    
    # Métodos
    def get_available_slots(self, date: date) -> list:
        """Obtener slots disponibles para una fecha"""
    
    def is_available_at(self, date: date, time: time) -> bool:
        """Verificar disponibilidad en fecha/hora específica"""
    
    def to_dict(self) -> dict:
        """Serializar a diccionario"""
```

#### Service Model
```python
class Service(db.Model):
    __tablename__ = 'services'
    
    # Columnas
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    icon = db.Column(db.String(255))
    color = db.Column(db.String(7))  # Hex color
    base_price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, 
                          onupdate=datetime.utcnow)
    
    # Relaciones
    appointments = db.relationship('Appointment', backref='service')
    
    # Métodos
    def to_dict(self) -> dict:
        """Serializar a diccionario"""
```

#### Appointment Model
```python
class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    # Columnas
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), 
                       nullable=False, index=True)
    technician_id = db.Column(db.Integer, db.ForeignKey('users.id'), 
                             nullable=True, index=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), 
                          nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    status = db.Column(db.Enum('pending', 'scheduled', 'in_progress', 
                              'completed', 'cancelled'),
                      default='pending', nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, 
                          onupdate=datetime.utcnow)
    
    # Índices compuestos para búsquedas eficientes
    __table_args__ = (
        db.Index('idx_user_date', 'user_id', 'date'),
        db.Index('idx_technician_date', 'technician_id', 'date'),
    )
    
    # Métodos
    def enrich(self) -> dict:
        """Enriquecer con datos de usuario, técnico y servicio"""
    
    def can_modify(self, user_id: int, user_role: str) -> bool:
        """Verificar si el usuario puede modificar esta cita"""
    
    def to_dict(self, enriched: bool = True) -> dict:
        """Serializar a diccionario"""
```

#### Device Model
```python
class Device(db.Model):
    __tablename__ = 'devices'
    
    # Columnas
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), 
                       nullable=False)
    user_agent = db.Column(db.Text)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_access = db.Column(db.DateTime, default=datetime.utcnow, 
                           onupdate=datetime.utcnow)
    
    # Métodos
    def to_dict(self) -> dict:
        """Serializar a diccionario"""
```

---

## 5. Autenticación y Seguridad

### 5.1 Flujo de Autenticación

```
┌──────────────────┐
│   Cliente        │
└────────┬─────────┘
         │
         │ POST /api/auth/login
         │ { email, password }
         ▼
┌──────────────────────────────────────┐
│ Backend - POST /api/auth/login       │
├──────────────────────────────────────┤
│ 1. Buscar usuario por email          │
│ 2. Verificar password (bcrypt)       │
│ 3. Verificar status (active)         │
│ 4. Generar JWT                       │
│ 5. Retornar token + user data        │
└────────┬─────────────────────────────┘
         │
         │ { token, user }
         ▼
┌──────────────────┐
│   Cliente        │
│ localStorage:    │
│   token          │
└────────┬─────────┘
         │
         │ GET /api/auth/profile
         │ Authorization: Bearer <token>
         ▼
┌──────────────────────────────────────┐
│ Backend - Middleware JWT             │
├──────────────────────────────────────┤
│ 1. Extraer token del header          │
│ 2. Verificar firma JWT               │
│ 3. Verificar expiración              │
│ 4. Buscar usuario                    │
│ 5. Verificar status y rol            │
│ 6. Proceder a ruta o retornar 401/403│
└────────┬─────────────────────────────┘
         │
         │ Usuario en request.g.user
         ▼
    ✓ Acceso autorizado
```

### 5.2 Hash de Contraseñas (bcrypt)

```python
# Almacenar
password = "user_password"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12))
# Guardar hashed en User.password_hash

# Verificar
if bcrypt.checkpw(input_password.encode(), user.password_hash):
    # Correcto
else:
    # Incorrecto
```

### 5.3 Tokens JWT

**Estructura:**
```json
{
  "sub": 1,          // User ID (subject)
  "email": "user@example.com",
  "role": "customer",
  "exp": 1719604800,   // Expiration (iat + 24 horas)
  "iat": 1719518400    // Issued At
}
```

**Validación:**
- Verificar firma con JWT_SECRET_KEY
- Verificar expiración (exp > current_time)
- Buscar usuario por sub y verificar que siga activo/tenga permisos

### 5.4 Decoradores Personalizados

```python
@jwt_required()
def protected_route():
    """Requiere JWT válido, user en g.user"""

@admin_only()
def admin_route():
    """Requiere JWT válido + role='admin'"""

@technician_only()
def technician_route():
    """Requiere JWT válido + role='technician'"""

@customer_only()
def customer_route():
    """Requiere JWT válido + role='customer'"""
```

### 5.5 Manejo de Errores de Autenticación

| Código | Situación | Respuesta |
|--------|-----------|----------|
| 400 | Email/contraseña inválidos | `{"error": "Invalid credentials"}` |
| 401 | Token ausente | `{"error": "Missing authorization token"}` |
| 401 | Token inválido/expirado | `{"error": "Invalid or expired token"}` |
| 403 | Insuficientes permisos | `{"error": "Insufficient permissions"}` |
| 200 | Login exitoso | `{"token": "...", "user": {...}}` |

---

## 6. Endpoints REST

### 6.1 Autenticación (`/api/auth`)

#### POST /api/auth/login
**Propósito:** Autenticar usuario y obtener JWT

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "status": "active",
    "phone": "+1234567890",
    "address": "123 Main St",
    "avatar": "https://..."
  }
}
```

**Error (400):**
```json
{
  "error": "Invalid email or password"
}
```

---

#### POST /api/auth/register
**Propósito:** Registrar nuevo usuario

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": "456 Oak St",
  "role": "customer"  // o "technician"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "status": "active",
    "phone": "+1234567890",
    "address": "456 Oak St",
    "avatar": null
  }
}
```

**Error (400):**
```json
{
  "error": "Email already registered"
}
```

---

#### POST /api/auth/forgot-password
**Propósito:** Solicitar reset de contraseña

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to email"
}
```

**Nota:** En producción, enviar email con link; en desarrollo, loguear token.

---

#### GET /api/auth/profile
**Propósito:** Obtener perfil del usuario autenticado

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "customer",
  "status": "active",
  "phone": "+1234567890",
  "address": "123 Main St",
  "avatar": "https://...",
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-06-29T14:22:00Z"
}
```

---

#### PATCH /api/auth/profile
**Propósito:** Actualizar perfil del usuario autenticado

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "address": "789 Elm St",
  "avatar": "https://new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Smith",
  "email": "user@example.com",
  "role": "customer",
  "phone": "+1234567890",
  "address": "789 Elm St",
  "avatar": "https://new-avatar.jpg",
  "updated_at": "2026-06-29T15:00:00Z"
}
```

---

#### POST /api/auth/logout
**Propósito:** Cerrar sesión (invalidar token en cliente)

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

**Nota:** El token se invalida en el cliente eliminándolo de localStorage.

---

### 6.2 Servicios (`/api/services`)

#### GET /api/services
**Propósito:** Listar todos los servicios disponibles

**Query Parameters:**
- `search` (opcional): Buscar por nombre
- `limit` (opcional, default=10): Límite de resultados
- `offset` (opcional, default=0): Desplazamiento

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Plumbing Repair",
      "icon": "🔧",
      "color": "#FF5733",
      "base_price": "50.00",
      "description": "General plumbing repairs"
    },
    {
      "id": 2,
      "name": "Installation",
      "icon": "🔨",
      "color": "#33FF57",
      "base_price": "100.00",
      "description": "New installations"
    }
  ],
  "total": 2
}
```

---

### 6.3 Técnicos (`/api/technicians`)

#### GET /api/technicians
**Propósito:** Listar técnicos disponibles

**Query Parameters:**
- `specialty` (opcional): Filtrar por especialidad
- `date` (opcional): Filtrar por disponibilidad en fecha
- `limit`, `offset` (opcional)

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Carlos García",
      "email": "carlos@example.com",
      "phone": "+1234567890",
      "avatar": "https://...",
      "specialties": ["plumbing", "gas"],
      "rating": 4.8,
      "bio": "10 years of experience",
      "available": true
    }
  ],
  "total": 1
}
```

---

#### GET /api/technicians/available
**Propósito:** Obtener técnicos disponibles para una fecha, hora y servicio

**Query Parameters:**
- `date` (requerido): Fecha YYYY-MM-DD
- `time` (requerido): Hora HH:MM
- `service_id` (requerido): ID del servicio

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Carlos García",
      "specialties": ["plumbing", "gas"],
      "rating": 4.8,
      "available": true,
      "slots": ["09:00", "10:00", "14:00"]
    }
  ],
  "total": 1
}
```

---

#### GET /api/technicians/slots
**Propósito:** Obtener slots disponibles de un técnico

**Query Parameters:**
- `technician_id` (requerido)
- `date` (requerido): Fecha YYYY-MM-DD
- `service_id` (requerido)

**Response (200):**
```json
{
  "technician_id": 2,
  "date": "2026-07-15",
  "slots": [
    "09:00", "09:30", "10:00", "10:30",
    "14:00", "14:30", "15:00"
  ]
}
```

---

#### GET /api/technicians/profile
**Propósito:** Obtener perfil del técnico autenticado

**Headers:** `Authorization: Bearer <token>` (requiere role='technician')

**Response (200):**
```json
{
  "user": {
    "id": 2,
    "name": "Carlos García",
    "email": "carlos@example.com",
    "phone": "+1234567890",
    "avatar": "https://..."
  },
  "specialties": ["plumbing", "gas"],
  "rating": 4.8,
  "bio": "10 years of experience",
  "schedule": {
    "mon": [["08:00", "17:00"]],
    "tue": [["08:00", "17:00"]],
    "wed": [["08:00", "17:00"]],
    "thu": [["08:00", "17:00"]],
    "fri": [["08:00", "17:00"]],
    "sat": [],
    "sun": []
  },
  "available": true
}
```

---

#### GET /api/technicians/appointments
**Propósito:** Obtener citas del técnico autenticado

**Headers:** `Authorization: Bearer <token>` (requiere role='technician')

**Query Parameters:**
- `date` (opcional): Filtrar por fecha
- `status` (opcional): Filtrar por estado
- `limit`, `offset` (opcional)

**Response (200):**
```json
{
  "data": [
    {
      "id": 5,
      "date": "2026-07-15",
      "time": "10:00",
      "status": "scheduled",
      "customer": {
        "id": 1,
        "name": "John Doe",
        "phone": "+1234567890",
        "address": "123 Main St"
      },
      "service": {
        "id": 1,
        "name": "Plumbing Repair",
        "base_price": "50.00"
      },
      "notes": "Fix the kitchen sink"
    }
  ],
  "total": 1
}
```

---

#### PATCH /api/technicians/appointments/:id
**Propósito:** Actualizar estado de cita (técnico)

**Headers:** `Authorization: Bearer <token>` (requiere role='technician')

**Request:**
```json
{
  "status": "in_progress"  // o "completed", "cancelled"
}
```

**Response (200):**
```json
{
  "id": 5,
  "date": "2026-07-15",
  "time": "10:00",
  "status": "in_progress",
  "customer": {...},
  "service": {...},
  "updated_at": "2026-06-29T15:30:00Z"
}
```

---

### 6.4 Citas (`/api/appointments`)

#### GET /api/appointments
**Propósito:** Obtener citas del usuario autenticado

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (opcional): Filtrar por estado
- `limit`, `offset` (opcional)

**Response (200):**
```json
{
  "data": [
    {
      "id": 5,
      "date": "2026-07-15",
      "time": "10:00",
      "status": "scheduled",
      "technician": {
        "id": 2,
        "name": "Carlos García",
        "phone": "+1234567890",
        "rating": 4.8
      },
      "service": {
        "id": 1,
        "name": "Plumbing Repair",
        "base_price": "50.00"
      },
      "notes": "Fix the kitchen sink",
      "created_at": "2026-06-20T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

#### GET /api/appointments/:id
**Propósito:** Obtener detalle de una cita

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 5,
  "date": "2026-07-15",
  "time": "10:00",
  "status": "scheduled",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+1234567890",
    "address": "123 Main St"
  },
  "technician": {
    "id": 2,
    "name": "Carlos García",
    "phone": "+1234567890",
    "rating": 4.8,
    "specialties": ["plumbing", "gas"]
  },
  "service": {
    "id": 1,
    "name": "Plumbing Repair",
    "base_price": "50.00"
  },
  "notes": "Fix the kitchen sink"
}
```

**Error (403):** Usuario no tiene permisos para ver esta cita.

---

#### POST /api/appointments
**Propósito:** Crear nueva cita

**Headers:** `Authorization: Bearer <token>` (requiere role='customer')

**Request:**
```json
{
  "service_id": 1,
  "date": "2026-07-15",
  "time": "10:00",
  "notes": "Fix the kitchen sink",
  "technician_id": 2  // opcional, si no se especifica buscar disponible
}
```

**Response (201):**
```json
{
  "id": 6,
  "date": "2026-07-15",
  "time": "10:00",
  "status": "pending",
  "service_id": 1,
  "technician_id": 2,
  "notes": "Fix the kitchen sink",
  "created_at": "2026-06-29T16:00:00Z"
}
```

**Error (400):**
- Servicio no existe
- Técnico no disponible en esa fecha/hora
- Fecha/hora en el pasado

---

#### PATCH /api/appointments/:id
**Propósito:** Actualizar cita

**Headers:** `Authorization: Bearer <token>`

**Request (customer):**
```json
{
  "date": "2026-07-16",
  "time": "14:00",
  "status": "cancelled",
  "notes": "Updated notes"
}
```

**Request (admin):**
```json
{
  "status": "completed",
  "technician_id": 3
}
```

**Response (200):**
```json
{
  "id": 5,
  "date": "2026-07-16",
  "time": "14:00",
  "status": "cancelled",
  "notes": "Updated notes",
  "updated_at": "2026-06-29T16:30:00Z"
}
```

---

### 6.5 Administración (`/api/admin`)

#### GET /api/admin/dashboard
**Propósito:** Obtener estadísticas del dashboard

**Headers:** `Authorization: Bearer <token>` (requiere role='admin')

**Response (200):**
```json
{
  "total_users": 50,
  "total_technicians": 8,
  "total_appointments": 150,
  "completed_appointments": 120,
  "pending_appointments": 20,
  "cancelled_appointments": 10,
  "revenue": "12500.00",
  "average_rating": 4.6,
  "recent_appointments": [
    {
      "id": 5,
      "customer": "John Doe",
      "technician": "Carlos García",
      "service": "Plumbing Repair",
      "date": "2026-06-29",
      "status": "completed"
    }
  ]
}
```

---

#### GET /api/admin/users
**Propósito:** Listar todos los usuarios

**Headers:** `Authorization: Bearer <token>` (requiere role='admin')

**Query Parameters:**
- `role` (opcional): Filtrar por rol
- `status` (opcional): Filtrar por estado
- `search` (opcional): Buscar por nombre/email
- `limit`, `offset` (opcional)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "customer",
      "status": "active",
      "phone": "+1234567890",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 50
}
```

---

#### POST /api/admin/users
**Propósito:** Crear nuevo usuario (admin)

**Headers:** `Authorization: Bearer <token>` (requiere role='admin')

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "temporary_password",
  "phone": "+1234567890",
  "role": "technician",
  "status": "active"
}
```

**Response (201):**
```json
{
  "id": 51,
  "name": "New User",
  "email": "newuser@example.com",
  "role": "technician",
  "status": "active",
  "created_at": "2026-06-29T16:45:00Z"
}
```

---

#### PATCH /api/admin/users/:id
**Propósito:** Actualizar usuario

**Headers:** `Authorization: Bearer <token>` (requiere role='admin')

**Request:**
```json
{
  "name": "Updated Name",
  "status": "suspended",
  "role": "technician"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Updated Name",
  "email": "user@example.com",
  "role": "technician",
  "status": "suspended",
  "updated_at": "2026-06-29T17:00:00Z"
}
```

---

#### PATCH /api/admin/appointments/:id
**Propósito:** Actualizar cita (admin)

**Headers:** `Authorization: Bearer <token>` (requiere role='admin')

**Request:**
```json
{
  "status": "completed",
  "technician_id": 3,
  "date": "2026-07-15",
  "time": "10:00"
}
```

**Response (200):**
```json
{
  "id": 5,
  "date": "2026-07-15",
  "time": "10:00",
  "status": "completed",
  "technician_id": 3,
  "updated_at": "2026-06-29T17:15:00Z"
}
```

---

### 6.6 Salud (`/api/health`)

#### GET /api/health
**Propósito:** Verificar estado del servidor

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-06-29T17:30:00Z",
  "database": "connected"
}
```

---

## 7. Lógica de Negocio

### 7.1 Búsqueda de Técnico Disponible

**Algoritmo:**
```
1. Parámetros de entrada: date, time, service_id
2. Buscar técnicos que tengan especialidad relacionada
3. Para cada técnico:
   a. Verificar disponibilidad en horario (schedule JSON)
   b. Verificar que no tenga cita conflictiva en esa fecha/hora
   c. Ordenar por rating (DESC)
4. Retornar primero disponible (mejor rating)
5. Si ninguno disponible, retornar error 400 "No technician available"
```

### 7.2 Enriquecimiento de Citas

**Cuando se retorna una cita, incluir:**
```python
{
  "id": appointment.id,
  "date": appointment.date,
  "time": appointment.time,
  "status": appointment.status,
  "notes": appointment.notes,
  
  # Enriquecido
  "customer": {
    "id": user.id,
    "name": user.name,
    "email": user.email,
    "phone": user.phone,
    "address": user.address
  },
  "technician": {
    "id": technician.id,
    "name": technician.name,
    "rating": technician_profile.rating,
    "specialties": technician_profile.specialties,
    "phone": technician.phone
  },
  "service": {
    "id": service.id,
    "name": service.name,
    "base_price": service.base_price,
    "icon": service.icon
  },
  
  "created_at": appointment.created_at,
  "updated_at": appointment.updated_at
}
```

### 7.3 Validaciones de Cita

Antes de crear/modificar una cita:
1. Verificar que el servicio exista
2. Verificar que la fecha/hora no esté en el pasado
3. Si se asigna técnico: verificar disponibilidad
4. Verificar que no haya conflicto horario para el técnico
5. Verificar permisos del usuario (solo puede modificar sus propias citas, excepto admin)

### 7.4 Cambios de Estado

```
pending → scheduled (cuando se asigna técnico)
scheduled → in_progress (técnico comienza trabajo)
in_progress → completed (trabajo finalizado)

Desde cualquier estado → cancelled (con validaciones)
```

### 7.5 Invalidación de JWT

El token se invalida si:
- El usuario está inactivo/suspended
- El rol del usuario cambió
- La sesión expiró (24 horas por defecto)
- Usuario manual logout desde cliente (eliminar localStorage)

---

## 8. Configuración de MySQL Workbench

### 8.1 Crear Base de Datos

**En MySQL Workbench:**

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS plomapp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'plomapp_user'@'localhost' IDENTIFIED BY 'strong_password_here';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON plomapp.* TO 'plomapp_user'@'localhost';
FLUSH PRIVILEGES;

-- Usar base de datos
USE plomapp;
```

### 8.2 Verificar Tablas (Después de Migraciones)

```sql
-- Listar tablas
SHOW TABLES;

-- Ver estructura de tabla
DESCRIBE users;
DESCRIBE technician_profiles;
DESCRIBE services;
DESCRIBE appointments;
DESCRIBE devices;

-- Ver índices
SHOW INDEXES FROM users;
SHOW INDEXES FROM appointments;
```

### 8.3 Comandos Útiles

```sql
-- Ver total de usuarios
SELECT role, COUNT(*) as total FROM users GROUP BY role;

-- Ver citas próximas
SELECT a.id, u.name as customer, t.name as technician, 
       a.date, a.time, a.status
FROM appointments a
JOIN users u ON a.user_id = u.id
LEFT JOIN users t ON a.technician_id = t.id
WHERE a.date >= CURDATE()
ORDER BY a.date, a.time;

-- Ver disponibilidad de técnico
SELECT name, specialties, rating, available 
FROM users u
JOIN technician_profiles tp ON u.id = tp.user_id
WHERE u.role = 'technician';

-- Backup de base de datos
-- (Usar menú: Server → Data Export)
```

---

## 9. Flujo de Desarrollo

### 9.1 Instalación y Setup Inicial

```bash
# 1. Clonar/crear proyecto
cd backend_flask

# 2. Crear virtualenv
python -m venv venv
.\venv\Scripts\activate  # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar .env
cp .env.example .env
# Editar .env con credenciales de MySQL

# 5. Crear base de datos (con Workbench)

# 6. Ejecutar migraciones
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# 7. Ejecutar servidor
python app.py
# O: flask run
```

### 9.2 Estructura de requirements.txt

```
Flask==2.3.0
Flask-SQLAlchemy==3.0.0
Flask-Migrate==4.0.0
Flask-JWT-Extended==4.4.0
Flask-CORS==3.0.10
bcrypt==4.0.1
python-dotenv==1.0.0
PyMySQL==1.1.0
cryptography==40.0.0
```

### 9.3 Pruebas con curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Obtener servicios
curl http://localhost:5000/api/services

# Obtener técnicos disponibles (con token)
curl http://localhost:5000/api/technicians/available \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Crear cita
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -d '{"service_id":1,"date":"2026-07-15","time":"10:00"}'
```

---

## 10. Consideraciones Frontend-Backend

### 10.1 Compatibilidad de API

- El frontend espera rutas exactas: `/api/auth/login`, `/api/auth/register`, etc.
- Las respuestas deben tener estructura JSON exacta
- Los códigos HTTP deben ser estándar (200, 201, 400, 401, 403, 404, 500)
- Errores siempre en formato: `{"error": "mensaje"}`

### 10.2 Manejo de Tokens en Cliente

```javascript
// Almacenar
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// Usar en requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// Logout
localStorage.removeItem('token');
localStorage.removeItem('user');
```

### 10.3 CORS

- Backend debe permitir origen del frontend (http://localhost:3000, http://localhost:5173, etc.)
- Permitir credenciales en headers `Content-Type`, `Authorization`
- Configurar `Access-Control-Allow-Origin`

### 10.4 Evolución a HttpOnly Cookies

**Futuro (sin cambios importantes):**
```python
# En lugar de retornar token en JSON
response.set_cookie(
    'authorization',
    token,
    httponly=True,
    secure=True,  # Solo en HTTPS
    samesite='Strict',
    max_age=86400
)
```

El frontend seguirá funcionando sin cambios si las cookies se envían automáticamente.

---

## 11. Seguridad

### 11.1 Checklist de Seguridad

- [ ] Contraseñas hasheadas con bcrypt (mínimo 12 rounds)
- [ ] JWT validado en cada endpoint protegido
- [ ] Validación de entrada (email, teléfono, etc.)
- [ ] Validación de permisos (role-based)
- [ ] CORS configurado correctamente
- [ ] Errores de autenticación sin revelar información sensible
- [ ] Variables sensibles en .env (NO versionadas)
- [ ] HTTPS en producción
- [ ] Rate limiting en endpoints sensibles (login, register)
- [ ] Logging de acciones sensibles (login, cambios de rol, etc.)

### 11.2 Validaciones de Entrada

```python
# Email
import re
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

# Teléfono (formato básico)
PHONE_REGEX = r'^\+?[\d\s\-\(\)]{10,}$'

# Contraseña mínima
MIN_PASSWORD_LENGTH = 8
```

---

## 12. Roadmap Futuro

**Fase 1 (Actual):**
- Auth básica con JWT
- CRUD de citas
- Gestión de técnicos
- Admin dashboard

**Fase 2:**
- Notificaciones por email/SMS
- Rating y reviews
- Pagos (Stripe/PayPal)
- Geolocalización

**Fase 3:**
- Análisis avanzado
- Recomendaciones de técnicos
- Reportes PDF
- Integración con calendario

---

## 13. Referencias y Recursos

### Librerías Principales
- **Flask:** https://flask.palletsprojects.com/
- **SQLAlchemy:** https://www.sqlalchemy.org/
- **Flask-JWT-Extended:** https://flask-jwt-extended.readthedocs.io/
- **bcrypt:** https://github.com/pyca/bcrypt
- **Flask-CORS:** https://flask-cors.readthedocs.io/

### MySQL
- **MySQL Workbench:** https://www.mysql.com/products/workbench/
- **MySQL Connector for Python:** https://dev.mysql.com/doc/connector-python/en/

### Buenas Prácticas
- RESTful API Guidelines: https://restfulapi.net/
- JWT Best Practices: https://tools.ietf.org/html/rfc7519
- OWASP Security Guidelines: https://owasp.org/

---

## 14. Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "data": { /* datos */ },
  "status": "success"
}
```

### Respuesta con Error
```json
{
  "error": "Descripción del error",
  "status": "error",
  "code": 400
}
```

### Respuesta de Lista (Paginada)
```json
{
  "data": [ /* array de items */ ],
  "total": 50,
  "limit": 10,
  "offset": 0
}
```

---

## Fin del Diseño

Este documento define completamente la arquitectura, modelos, endpoints y lógica de negocio del backend Flask. Sirve como guía de implementación exhaustiva manteniendo compatibilidad total con el frontend existente.

**Próximo paso:** Implementación del código del backend siguiendo esta especificación.
