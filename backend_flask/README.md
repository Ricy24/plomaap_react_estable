# PlomApp Backend - Flask API

Backend modular y escalable para PlomApp (gestión de citas de plomería).

**Versión:** 2.0 | **Estado:** 100% Implementado

---

## Inicio Rápido

```bash
# 1. Crear BD MySQL
mysql -u root -p
CREATE DATABASE plomapp CHARACTER SET utf8mb4;
CREATE USER 'plomapp_user'@'localhost' IDENTIFIED BY 'plomapp_password_123';
GRANT ALL PRIVILEGES ON plomapp.* TO 'plomapp_user'@'localhost';
FLUSH PRIVILEGES;

# 2. Configurar entorno
cp .env.example .env

# 3. Instalar y ejecutar
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
flask db upgrade
python run.py
```

**Servidor:** `http://localhost:5000`

---

## 📂 Estructura

```
backend_flask/
├── run.py                  # Punto de entrada
├── app/                    # Aplicación modular
│   ├── __init__.py        # Factory pattern
│   ├── config/            # Configuraciones
│   ├── database/          # Models + Extensions
│   ├── controllers/       # Lógica de negocio
│   ├── routes/            # 6 Blueprints (24 endpoints)
│   ├── middlewares/       # Error handlers
│   ├── services/          # Servicios
│   └── utils/             # Decoradores, validators
├── docs/                  # Documentación
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Documentación

Todo está en la carpeta **`docs/`**:

| Archivo | Descripción |
|---------|------------|
| **[docs/STRUCTURE.md](docs/STRUCTURE.md)** | Estructura del proyecto |
| **[docs/INSTALL_QUICK.md](docs/INSTALL_QUICK.md)** | Guía de instalación |
| **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** | Referencia de endpoints |
| **[docs/BACKEND_DESIGN.md](docs/BACKEND_DESIGN.md)** | Especificación completa |
| **[docs/ARCHITECTURE_FLOWS.md](docs/ARCHITECTURE_FLOWS.md)** | Diagramas y flujos |
| **[docs/MIGRATION.md](docs/MIGRATION.md)** | Cambios v1 → v2 |

---

## Características

- **24 endpoints REST** funcionales
- Autenticación JWT + bcrypt
- 5 modelos SQLAlchemy
- Control de acceso por roles
- Dashboard administrativo
- Búsqueda inteligente de técnico
- Validación de entrada centralizada

---

## 🔌 Endpoints Principales

### Autenticación (6)
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET/PATCH /api/auth/profile`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`

### Servicios (2)
- `GET /api/services`
- `GET /api/services/<id>`

### Técnicos (6)
- `GET /api/technicians`
- `GET /api/technicians/available`
- `GET /api/technicians/slots`
- `GET /api/technicians/profile`
- `GET /api/technicians/appointments`
- `PATCH /api/technicians/appointments/<id>`

### Citas (4)
- `GET/POST /api/appointments`
- `GET/PATCH /api/appointments/<id>`

### Admin (5)
- `GET /api/admin/dashboard`
- `GET/POST /api/admin/users`
- `PATCH /api/admin/users/<id>`
- `PATCH /api/admin/appointments/<id>`

### Salud (1)
- `GET /api/health`

---

## ⚙️ Variables de Entorno (.env)

```bash
FLASK_ENV=development
FLASK_APP=run.py
FLASK_PORT=5000
DEBUG=True

# MySQL
MYSQL_USER=plomapp_user
MYSQL_PASSWORD=plomapp_password_123
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=plomapp

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🧪 Prueba Rápida

```bash
# Verificar salud
curl http://localhost:5000/api/health

# Registrarse
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "customer"
  }'
```

---

## 📖 Para Empezar

1. **Leer:** [docs/STRUCTURE.md](docs/STRUCTURE.md)
2. **Instalar:** [docs/INSTALL_QUICK.md](docs/INSTALL_QUICK.md)
3. **Endpoints:** [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)

---

**Backend modular, escalable y listo para producción** ✨
