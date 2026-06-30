# PlomApp Backend - Diagrama de Flujos y Arquitectura

## 1. Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         React/Vite Frontend                              │
│                      (http://localhost:3000)                             │
│                   src/services/api.js consume API                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTP/JSON + JWT Token
                                 │ in Authorization Header
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Flask Backend API                                   │
│                   (http://localhost:5000)                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ app.py - Factory & Main Server                               │      │
│  │   ├─ Crear aplicación Flask                                 │      │
│  │   ├─ Inicializar extensiones (db, jwt, cors)               │      │
│  │   ├─ Registrar blueprints                                   │      │
│  │   └─ Manejadores de errores globales                        │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ routes/ - Blueprints por funcionalidad                       │      │
│  │   ├─ auth.py (login, register, profile, logout)            │      │
│  │   ├─ services.py (listar servicios)                         │      │
│  │   ├─ technicians.py (buscar técnicos, disponibilidad)      │      │
│  │   ├─ appointments.py (CRUD citas)                          │      │
│  │   ├─ admin.py (dashboard, usuarios)                        │      │
│  │   └─ health.py (estado del servidor)                       │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ utils/ - Funciones auxiliares                               │      │
│  │   ├─ decorators.py (@jwt_required, @admin_only, etc.)     │      │
│  │   ├─ validators.py (validar email, teléfono, etc.)        │      │
│  │   ├─ jwt_utils.py (generar, validar tokens)               │      │
│  │   └─ password_utils.py (bcrypt hash/verify)               │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ models.py - SQLAlchemy ORM                                  │      │
│  │   ├─ User                                                    │      │
│  │   ├─ TechnicianProfile                                      │      │
│  │   ├─ Service                                                │      │
│  │   ├─ Appointment                                            │      │
│  │   └─ Device                                                 │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ extensions.py - Inicialización de librerías                  │      │
│  │   ├─ SQLAlchemy (db)                                        │      │
│  │   ├─ Flask-JWT-Extended (jwt)                              │      │
│  │   ├─ Flask-CORS (cors)                                     │      │
│  │   └─ Flask-Migrate (migrate)                               │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ config.py - Configuración                                   │      │
│  │   ├─ Config (base)                                          │      │
│  │   ├─ DevelopmentConfig                                      │      │
│  │   ├─ ProductionConfig                                       │      │
│  │   └─ TestingConfig                                          │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ SQLAlchemy ORM
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MySQL Database                                   │
│                    (localhost:3306)                                      │
│                                                                          │
│  tables: users, technician_profiles, services,                          │
│          appointments, devices                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Autenticación (Login)

```
┌───────────────────────────────────────────────────────────────────┐
│ Cliente (React)                                                     │
├───────────────────────────────────────────────────────────────────┤
│ 1. Usuario ingresa email + contraseña                             │
│ 2. Click en "Login"                                               │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 │ POST /api/auth/login
                 │ { email, password }
                 ▼
┌───────────────────────────────────────────────────────────────────┐
│ Backend - auth.py (POST /api/auth/login)                          │
├───────────────────────────────────────────────────────────────────┤
│ 3. Validar entrada (email, password)                              │
│ 4. Buscar usuario: User.query.filter_by(email=...).first()       │
│ 5. Si NO existe → return 400 "Invalid credentials"                │
│ 6. Verificar password con bcrypt.checkpw()                        │
│ 7. Si incorrecto → return 400 "Invalid credentials"               │
│ 8. Verificar status = 'active'                                    │
│ 9. Si no → return 403 "User not active"                           │
│ 10. Generar JWT: create_access_token(user.id)                     │
│     - Payload: { sub: user_id, email, role, exp, iat }           │
│     - Firmado con JWT_SECRET_KEY                                  │
│ 11. Return 200 + { token, user }                                  │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 │ { token: "eyJ...", user: {...} }
                 ▼
┌───────────────────────────────────────────────────────────────────┐
│ Cliente (React)                                                     │
├───────────────────────────────────────────────────────────────────┤
│ 12. localStorage.setItem('token', token)                          │
│ 13. localStorage.setItem('user', JSON.stringify(user))            │
│ 14. Redirect a /dashboard                                         │
└───────────────────────────────────────────────────────────────────┘
```

---

## 3. Flujo de Solicitud Protegida (con JWT)

```
┌───────────────────────────────────────────────────────────────────┐
│ Cliente (React)                                                     │
├───────────────────────────────────────────────────────────────────┤
│ 1. GET /api/appointments                                          │
│    Headers: {                                                      │
│      'Authorization': 'Bearer eyJ...'                             │
│    }                                                              │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────┐
│ Backend Middleware (Flask-JWT-Extended)                            │
├───────────────────────────────────────────────────────────────────┤
│ 2. Extraer token del header "Authorization: Bearer <token>"       │
│ 3. Si no existe → 401 "Missing authorization token"              │
│ 4. Verificar firma JWT con JWT_SECRET_KEY                         │
│ 5. Si inválida → 401 "Invalid token"                             │
│ 6. Verificar expiración (exp > current_time)                      │
│ 7. Si expirado → 401 "Token expired"                             │
│ 8. Extraer identity (sub = user_id) del payload                   │
│ 9. Extraer claims (email, role, status, exp, iat)                │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────┐
│ Decorador @jwt_required_custom                                     │
├───────────────────────────────────────────────────────────────────┤
│ 10. Si status != 'active' → 403 "User not active"                │
│ 11. Permitir acceso a la ruta                                     │
│ 12. g.user_id = identity (disponible en la ruta)                 │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────┐
│ Backend - appointments.py (GET /api/appointments)                  │
├───────────────────────────────────────────────────────────────────┤
│ 13. Obtener user_id del JWT                                       │
│ 14. Query: Appointment.query.filter_by(user_id=user_id)          │
│ 15. Enriquecer con datos de cliente, técnico, servicio            │
│ 16. Return 200 + array de citas enriquecidas                      │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 │ { data: [...], total: N }
                 ▼
┌───────────────────────────────────────────────────────────────────┐
│ Cliente (React)                                                     │
├───────────────────────────────────────────────────────────────────┤
│ 17. Procesar respuesta                                            │
│ 18. Mostrar citas en UI                                           │
└───────────────────────────────────────────────────────────────────┘
```

---

## 4. Flujo de Creación de Cita

```
┌────────────────────────────────────────────────────────────────┐
│ Cliente (React)                                                 │
├────────────────────────────────────────────────────────────────┤
│ 1. Usuario selecciona servicio, fecha, hora                   │
│ 2. Click en "Agendar"                                         │
│ 3. POST /api/appointments                                     │
│    {                                                           │
│      service_id: 1,                                           │
│      date: "2026-07-15",                                      │
│      time: "10:00",                                           │
│      notes: "..."                                            │
│    }                                                           │
└────────────┬──────────────────────────────────────────────────┘
             │
             ▼ @jwt_required_custom
┌────────────────────────────────────────────────────────────────┐
│ Backend - appointments.py (POST /api/appointments)              │
├────────────────────────────────────────────────────────────────┤
│ 4. Obtener user_id del JWT (cliente/customer)                 │
│ 5. Validar entrada (service_id, date, time)                   │
│ 6. Verificar que servicio existe                              │
│ 7. Verificar que fecha/hora >= ahora                          │
│ 8. Crear cita en estado 'pending'                             │
│    appointment = Appointment(                                  │
│      user_id=user_id,                                         │
│      service_id=service_id,                                   │
│      date=date,                                               │
│      time=time,                                               │
│      status='pending',                                        │
│      notes=notes                                              │
│    )                                                           │
│ 9. db.session.add(appointment)                                │
│ 10. db.session.commit()                                       │
│ 11. Buscar técnico disponible:                                │
│     - Filtrar técnicos con especialidad                       │
│     - Verificar horario disponible                            │
│     - Sin conflictos en esa fecha/hora                        │
│     - Ordenar por rating DESC                                 │
│ 12. Si encuentra → asignar: appointment.technician_id = tech │
│ 13. Si NO encuentra → dejar NULL                              │
│ 14. appointment.status = 'scheduled' (si técnico asignado)   │
│ 15. db.session.commit()                                       │
│ 16. Return 201 + appointment enriquecida                      │
└────────────┬──────────────────────────────────────────────────┘
             │
             │ { id: 5, date: "2026-07-15", ... }
             ▼
┌────────────────────────────────────────────────────────────────┐
│ Cliente (React)                                                 │
├────────────────────────────────────────────────────────────────┤
│ 17. Mostrar confirmación                                       │
│ 18. Redirigir a /appointments                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Flujo de Búsqueda de Técnico Disponible

```
┌────────────────────────────────────────────────────────────────┐
│ Query: GET /api/technicians/available                           │
│        ?date=2026-07-15&time=10:00&service_id=1              │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────┐
│ Backend - technicians.py                                        │
├────────────────────────────────────────────────────────────────┤
│ 1. Obtener parámetros: date, time, service_id                │
│ 2. Validar fecha/hora                                         │
│ 3. Obtener servicio:                                          │
│    service = Service.query.get(service_id)                   │
│    if not service → 404 "Service not found"                  │
│ 4. Filtrar técnicos con especialidad (si aplica):           │
│    technicians = User.query.filter(               │
│      User.role == 'technician',                 │
│      User.status == 'active',                   │
│      TechnicianProfile.available == True        │
│    ).all()                                                    │
│ 5. Para cada técnico:                                        │
│    a) Obtener su perfil: profile = tech.technician_profile  │
│    b) Verificar horario en schedule (JSON):                 │
│       - Extraer día de semana (Mon, Tue, etc.)             │
│       - Obtener slots del día: [[08:00, 17:00], ...]       │
│       - Verificar que time está dentro                      │
│    c) Buscar conflictos de cita:                           │
│       existing = Appointment.query.filter(        │
│         Appointment.technician_id == tech.id,             │
│         Appointment.date == date,                         │
│         Appointment.time == time,                         │
│         Appointment.status != 'cancelled'                 │
│       ).first()                                             │
│       if existing → técnico NO disponible                  │
│    d) Si está disponible → agregar a lista                │
│ 6. Ordenar técnicos por rating DESC                        │
│ 7. Return 200 + array de técnicos disponibles               │
│    {                                                         │
│      technician_id: 2,                                      │
│      name: "Carlos",                                        │
│      rating: 4.8,                                          │
│      specialties: ["plumbing"],                            │
│      available: true                                       │
│    }                                                         │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Modelo de Datos - Relaciones

```
                          User
                    ┌─────┴─────┐
                    │           │
                    │ id        │ 1 (technician)
                    │ name      │
                    │ email     │ ─── many ──┐
                    │ password  │            │
                    │ role      │            ▼
                    │ status    │      TechnicianProfile
                    │ ...       │      ├─ specialties (JSON)
                    │           │      ├─ rating
                    └─────┬─────┘      ├─ schedule (JSON)
                          │           └─ available
             many ────────┼────────────────────── 1
                          │
                  Appointment
                  ├─ user_id (customer) ────┐
                  ├─ technician_id (tech)  ──┴─→ User
                  ├─ service_id ────────────┐
                  ├─ date                   │
                  ├─ time                   ▼
                  ├─ status                Service
                  └─ notes            ├─ name
                                      ├─ icon
                                      ├─ color
                                      ├─ base_price
                                      └─ description

Device (tracking)
├─ user_id ─────────→ User
├─ user_agent
├─ registered_at
└─ last_access
```

---

## 7. Máquina de Estados de Cita

```
                     ┌─────────────┐
                     │   CREATED   │
                     │  (pending)  │
                     └──────┬──────┘
                            │
                ┌───────────┼───────────┐
                │                       │
        [Manual Assign]         [Auto Find Technician]
                │                       │
                ▼                       ▼
        ┌─────────────┐         ┌─────────────┐
        │ SCHEDULED   │────────→│ SCHEDULED   │
        │(assigned)   │         │(auto-assigned)
        └──────┬──────┘         └──────┬──────┘
               │                       │
               └───────────┬───────────┘
                           │
                    [Technician starts]
                           │
                           ▼
                    ┌─────────────┐
                    │IN_PROGRESS  │
                    └──────┬──────┘
                           │
                 ┌─────────┼─────────┐
                 │                   │
          [Complete]          [Cancel]
                 │                   │
                 ▼                   ▼
            ┌────────────┐      ┌──────────────┐
            │ COMPLETED  │      │  CANCELLED   │
            └────────────┘      └──────────────┘
               (final)              (final)

Transiciones permitidas:
- pending → scheduled (cuando se asigna técnico)
- scheduled → in_progress (técnico comienza)
- in_progress → completed (trabajo finalizado)
- Desde cualquier estado → cancelled
```

---

## 8. Flujo de Autorización (Role-Based)

```
Request con JWT
       │
       ▼
┌─────────────────────────────────────┐
│ Validar JWT (signature + expiration)│
└────────┬────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │ Extraer role del payload    │
    │ (customer|technician|admin) │
    └────────┬────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌────────┐┌──────────┐┌─────────┐
│Customer││Technician││ Admin   │
└───┬────┘└────┬─────┘└────┬────┘
    │          │           │
    │          │           │
GET │ • Ver     │ • Ver      │ • Acceder a
API │   propias │   propias   │   /api/admin
    │   citas   │   citas     │ • Ver todos los
    │ • Crear   │ • Cambiar   │   usuarios
    │   citas   │   estado    │ • Crear/editar
    │ • Ver     │   de citas  │   usuarios
    │   técnicos│ • Ver       │ • Ver dashboard
    │ • Ver     │   perfil    │ • Modificar
    │   perfil  │ • Editar    │   cualquier cita
    │ • Editar  │   perfil    │
    │   perfil  │             │
    │           │             │
    └───────────┴─────────────┘
```

---

## 9. Estructura de Response API

```
ÉXITO (200, 201):
{
  "data": {...},
  "status": "success"
}

o (list):
{
  "data": [...],
  "total": 50,
  "limit": 10,
  "offset": 0
}

ERROR (400, 401, 403, 404, 500):
{
  "error": "Descripción del error",
  "status": "error",
  "code": 400
}
```

---

## 10. Ciclo de Desarrollo

```
1. AMBIENTE DE DESARROLLO
   ├─ Python virtualenv
   ├─ MySQL local
   ├─ .env con credenciales locales
   └─ Flask en http://localhost:5000

2. IMPLEMENTACIÓN
   ├─ Crear modelos en models.py
   ├─ Crear migraciones: flask db migrate
   ├─ Aplicar migraciones: flask db upgrade
   ├─ Crear blueprints en routes/
   ├─ Agregar decoradores en utils/
   └─ Implementar lógica de negocio

3. TESTING
   ├─ Pruebas unitarias
   ├─ Pruebas de integración
   ├─ Validar endpoints con curl
   └─ Verificar en MySQL Workbench

4. INTEGRACIÓN FRONTEND
   ├─ Verificar CORS
   ├─ Validar formato de requests
   ├─ Confirmar estructura de responses
   └─ Probar login y almacenamiento de token

5. PRODUCCIÓN
   ├─ HTTPS habilitado
   ├─ Variables de entorno seguras
   ├─ JWT expiration ajustado
   ├─ Rate limiting en endpoints sensibles
   └─ Logging y monitoreo
```

---

**Próximo:** Consultar BACKEND_DESIGN.md para especificaciones completas de cada componente.
