# PlomApp - Guía Rápida de Ejecución

## 🚀 Cómo ejecutar el proyecto completo

### Frontend (React + Vite)
```bash
npm run dev
```
El frontend se abrirá en `http://localhost:5173`

### Backend (Node.js + Express)

#### Opción 1: Usar script batch (Windows)
1. Navega a la carpeta `backend/`
2. Haz doble clic en `instalar.bat` (primera vez para instalar)
3. Luego haz doble clic en `iniciar.bat` para ejecutar el servidor

#### Opción 2: Línea de comandos
```bash
cd backend
npm install
npm start
```

El backend correrá en `http://localhost:5000`

---

## 📋 Credenciales de Prueba

Para probar el login en el frontend:

| Email | Contraseña |
|-------|-----------|
| andres@example.com | 123456 |
| maria@example.com | 123456 |
| tecnico@example.com | 123456 |

---

## 🎯 Flujo de Uso

1. **Frontend abierto**: `http://localhost:5173`
2. **Backend corriendo**: `http://localhost:5000`
3. En el Home, haz clic en "Ingresar a mi cuenta"
4. Usa las credenciales de prueba arriba
5. ¡Listo! El sistema te mostrará un mensaje de bienvenida

---

## 📂 Estructura del Proyecto

```
plomaap_react_estable/
├── src/               # Frontend React
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── Auth.jsx   # Login y Registro
│   ├── styles/
│   └── App.jsx
├── backend/           # Backend Node.js
│   ├── server.js      # Servidor Express
│   ├── db.json        # Base de datos
│   ├── package.json
│   ├── README.md      # Documentación backend
│   ├── instalar.bat   # Script de instalación (Windows)
│   └── iniciar.bat    # Script de inicio (Windows)
└── package.json       # Frontend
```

---

## ⚙️ Características Implementadas

### Frontend
- ✅ Home responsive
- ✅ Auth (Login/Registro)
- ✅ Conexión con backend
- ✅ Gestión de tokens en localStorage

### Backend
- ✅ Login de usuarios
- ✅ Registro de nuevos usuarios
- ✅ Gestión de tokens
- ✅ Base de datos JSON simulada
- ✅ CORS habilitado

---

## 🐛 Solución de Problemas

### "Error de conexión con el servidor"
- Verifica que el backend esté corriendo en `http://localhost:5000`
- Asegúrate de tener dos terminales: una para frontend y otra para backend

### "Email o contraseña incorrectos"
- Usa los emails de la tabla de credenciales arriba
- Recuerda que es case-sensitive

### "Node no se encuentra"
- Instala Node.js desde https://nodejs.org
- Reinicia tu terminal después de instalar

---

## 📞 Soporte

Para más información sobre el backend, consulta: `backend/README.md`
