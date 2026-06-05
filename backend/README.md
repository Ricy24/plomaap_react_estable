# Backend PlomApp - Guía de Instalación y Uso

## Descripción

Backend simulado para PlomApp que proporciona autenticación mediante una base de datos JSON.

## Características

- ✅ Login de usuarios
- ✅ Registro de nuevos usuarios
- ✅ Gestión de perfiles
- ✅ Base de datos en JSON
- ✅ CORS habilitado para desarrollo

## Instalación

### 1. Ir a la carpeta backend

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar el servidor

```bash
npm start
```

o en modo desarrollo:

```bash
npm run dev
```

Deberías ver:
```
🚀 Backend de PlomApp ejecutándose en http://localhost:5000
📝 Usuarios de prueba disponibles en db.json

Credenciales de prueba:
  Email: andres@example.com
  Contraseña: 123456
```

## Endpoints Disponibles

### 1. Login
**POST** `/api/auth/login`

```json
{
  "email": "andres@example.com",
  "password": "123456"
}
```

Respuesta exitosa:
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "name": "Andrés Pérez",
    "email": "andres@example.com",
    "phone": "3001234567",
    "role": "user",
    "createdAt": "2024-01-15"
  },
  "token": "token_1_1234567890"
}
```

### 2. Registro
**POST** `/api/auth/register`

```json
{
  "name": "Juan Nuevo",
  "email": "juan@example.com",
  "password": "123456",
  "phone": "3009876543"
}
```

### 3. Obtener Perfil
**GET** `/api/auth/profile`

Headers:
```
Authorization: Bearer token_1_1234567890
```

### 4. Logout
**POST** `/api/auth/logout`

### 5. Health Check
**GET** `/api/health`

## Usuarios de Prueba (en db.json)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| andres@example.com | 123456 | user |
| maria@example.com | 123456 | user |
| tecnico@example.com | 123456 | technician |

## Estructura del Proyecto

```
backend/
├── server.js          # Servidor Express
├── db.json           # Base de datos JSON
├── package.json      # Dependencias
└── README.md         # Esta guía
```

## Base de Datos (db.json)

La base de datos contiene un array de usuarios con la siguiente estructura:

```json
{
  "users": [
    {
      "id": 1,
      "name": "Andrés Pérez",
      "email": "andres@example.com",
      "password": "123456",
      "phone": "3001234567",
      "role": "user",
      "createdAt": "2024-01-15"
    }
  ]
}
```

## Notas Importantes

⚠️ **Advertencia:** Esta es una base de datos simulada para desarrollo. No uses en producción.

- Las contraseñas se almacenan en texto plano (solo para pruebas)
- Los datos se pierden si eliminas db.json
- No hay validación avanzada de contraseñas
- El token es simplemente un identificador temporal

## Próximas Mejoras

- [ ] Hash de contraseñas con bcrypt
- [ ] JWT tokens reales
- [ ] Validación de emails
- [ ] Rate limiting
- [ ] Refresh tokens
- [ ] Base de datos real (MongoDB, PostgreSQL)

## Troubleshooting

### "Error de conexión con el servidor"
Asegúrate de que:
1. El backend está ejecutándose en puerto 5000
2. Tienes `http://localhost:5000` en las URLs del frontend
3. CORS está habilitado en el servidor (ya está en server.js)

### "Email o contraseña incorrectos"
Verifica las credenciales de prueba arriba. Recuerda que es case-sensitive.

### "Error leyendo la base de datos"
Asegúrate de que `db.json` existe en la carpeta backend y es válido JSON.

## Autor

Creado para PlomApp - Sistema de Mantenimiento y Plomería
