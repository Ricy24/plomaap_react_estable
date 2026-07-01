# PlomApp Backend - Guía Rápida de Referencia

## Checklist de Archivos a Crear

- [ ] `app.py` - Aplicación principal
- [ ] `config.py` - Configuración centralizada
- [ ] `extensions.py` - Inicialización de extensiones (SQLAlchemy, JWT, CORS)
- [ ] `models.py` - Definición de modelos SQLAlchemy
- [ ] `.env` - Variables de entorno
- [ ] `requirements.txt` - Dependencias
- [ ] `routes/auth.py` - Endpoints de autenticación
- [ ] `routes/services.py` - Endpoints de servicios
- [ ] `routes/technicians.py` - Endpoints de técnicos
- [ ] `routes/appointments.py` - Endpoints de citas
- [ ] `routes/admin.py` - Endpoints administrativos
- [ ] `routes/health.py` - Endpoint de salud
- [ ] `utils/jwt_utils.py` - Utilidades JWT
- [ ] `utils/password_utils.py` - Utilidades de contraseñas
- [ ] `utils/validators.py` - Validadores
- [ ] `utils/decorators.py` - Decoradores personalizados
- [ ] `migrations/` - Migraciones (generadas por Flask-Migrate)

## Modelos Principales

### User
```
id, name, email, password_hash, phone, address, avatar, 
role (customer|technician|admin), status (active|inactive|suspended), 
created_at, updated_at
```

### TechnicianProfile
```
id, user_id (FK), specialties (JSON), rating, bio, 
schedule (JSON), available, created_at, updated_at
```

### Service
```
id, name, icon, color, base_price, description, created_at, updated_at
```

### Appointment
```
id, user_id (FK), technician_id (FK nullable), service_id (FK), 
date, time, status (pending|scheduled|in_progress|completed|cancelled), 
notes, created_at, updated_at
```

### Device
```
id, user_id (FK), user_agent, registered_at, last_access
```

## Autenticación

**Flujo:**
1. Usuario envía email + password a `POST /api/auth/login`
2. Backend verifica con bcrypt
3. Genera JWT con sub=user_id, email, role
4. Retorna token + user data
5. Cliente almacena token en localStorage
6. Próximas requests incluyen `Authorization: Bearer <token>`

**Decoradores a usar:**
- `@jwt_required()` - Valida JWT
- `@admin_only()` - Solo admin
- `@technician_only()` - Solo técnico
- `@customer_only()` - Solo cliente

## Endpoints por Categoría

### Auth (8 endpoints)
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/forgot-password
- GET /api/auth/profile
- PATCH /api/auth/profile
- POST /api/auth/logout

### Services (1 endpoint)
- GET /api/services

### Technicians (6 endpoints)
- GET /api/technicians
- GET /api/technicians/available
- GET /api/technicians/slots
- GET /api/technicians/profile
- GET /api/technicians/appointments
- PATCH /api/technicians/appointments/:id

### Appointments (4 endpoints)
- GET /api/appointments
- GET /api/appointments/:id
- POST /api/appointments
- PATCH /api/appointments/:id

### Admin (5 endpoints)
- GET /api/admin/dashboard
- GET /api/admin/users
- POST /api/admin/users
- PATCH /api/admin/users/:id
- PATCH /api/admin/appointments/:id

### Health (1 endpoint)
- GET /api/health

**Total: 25 endpoints**

## 🛠️ Lógica Crítica de Negocio

### 1. Búsqueda de Técnico Disponible
```
- Filtrar técnicos con especialidad requerida
- Verificar horario disponible (JSON schedule)
- Verificar sin conflictos de cita en fecha/hora
- Ordenar por rating DESC
- Retornar primero disponible
```

### 2. Validación de Cita
```
- Servicio existe
- Fecha/hora >= ahora
- Si se asigna técnico: verificar disponibilidad
- Sin conflictos horarios
- Usuario tiene permiso (owner o admin)
```

### 3. Enriquecimiento de Cita
```
- Incluir customer { id, name, email, phone, address }
- Incluir technician { id, name, rating, specialties, phone }
- Incluir service { id, name, base_price, icon }
```

### 4. Invalidación de JWT
- Usuario inactivo/suspended → 401
- Rol cambió → 401
- Token expirado → 401
- Usuario eliminado → 401

## Variables de Entorno (`.env`)

```env
FLASK_ENV=development
SECRET_KEY=xxx
MYSQL_USER=plomapp_user
MYSQL_PASSWORD=xxx
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=plomapp
JWT_SECRET_KEY=xxx
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
DEBUG=True
```

## Setup MySQL

```sql
CREATE DATABASE IF NOT EXISTS plomapp 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'plomapp_user'@'localhost' IDENTIFIED BY 'strong_password';

GRANT ALL PRIVILEGES ON plomapp.* TO 'plomapp_user'@'localhost';

FLUSH PRIVILEGES;
```

## Comandos de Desarrollo

```bash
# Setup inicial
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Migraciones
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Ejecutar
python app.py
# O
flask run --port 5000

# Testing
curl -X GET http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
```

## Estructura de Respuestas

**Exitoso (200, 201):**
```json
{
  "data": { /* contenido */ },
  "status": "success"
}
```

**Error (400, 401, 403, 404, 500):**
```json
{
  "error": "Descripción del error",
  "status": "error",
  "code": 400
}
```

**Lista paginada:**
```json
{
  "data": [ /* items */ ],
  "total": 50,
  "limit": 10,
  "offset": 0
}
```

## Validaciones Críticas

- Email único y válido (regex)
- Contraseña mínimo 8 caracteres
- Teléfono formato válido (regex)
- Fecha/hora no en pasado
- Role válido (customer|technician|admin)
- Status válido (active|inactive|suspended)
- Appointment status válido (pending|scheduled|in_progress|completed|cancelled)

## Seguridad

- Contraseñas con bcrypt (12+ rounds)
- JWT validado en cada endpoint
- CORS configurado
- Validación de entrada
- Role-based access control
- Variables sensibles en .env
- Manejo seguro de errores (sin info sensible)

## Notas Importantes

1. **Frontend espera API exacta** - No cambiar rutas
2. **Token en localStorage** - Cliente responsable de almacenamiento
3. **CORS para Vite** - Incluir :5173
4. **MySQL Workbench** - Verificar tablas después de migraciones
5. **Logs de seguridad** - Registrar login fallidos, cambios de rol
6. **Expiración JWT** - 24 horas por defecto, configurable

## Compatibilidad Frontend

El frontend está configurado para consumir esta API exactamente desde `src/services/api.js`:
- Base URL: `http://localhost:5000`
- Rutas esperadas: `/api/auth/*`, `/api/services`, etc.
- Token en localStorage
- Header: `Authorization: Bearer <token>`
- CORS: permitir localhost:3000 o :5173

---

**Documento de diseño completo:** `BACKEND_DESIGN.md`
