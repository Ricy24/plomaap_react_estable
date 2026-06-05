# Configuración: Upload de Imagen y Google Login

## 1. Cloudinary (Almacenamiento de imágenes - 25GB gratis)

### Pasos:

1. **Registrarse** en https://cloudinary.com/console (es gratis)

2. **Obtener Cloud Name:**
   - Entra al dashboard
   - En la parte superior verás tu **Cloud Name** (algo como `dzxxxxxxxx`)
   - Cópialo

3. **Crear Upload Preset (sin autenticación):**
   - Ir a Settings → Upload
   - Scroll hacia abajo hasta "Upload presets"
   - Click en "Add upload preset"
   - Nombre: `unsigned_preset` (o el que prefieras)
   - **Signing Mode:** unsigned (sin autenticación)
   - **Allowed formats:** jpg, jpeg, png, gif, webp
   - Click en "Create"

4. **Actualizar `.env`:**
   ```
   VITE_CLOUDINARY_CLOUD_NAME=dzxxxxxxxx
   VITE_CLOUDINARY_UPLOAD_PRESET=unsigned_preset
   ```

---

## 2. Google OAuth 2.0

### Pasos:

1. **Crear proyecto** en https://console.cloud.google.com/

2. **Crear OAuth 2.0 Credentials:**
   - Ir a **APIs & Services** → **Credentials**
   - Click en **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173` (Vite desarrollo)
     - `http://localhost:3000` (si lo necesitas)
   - Authorized redirect URIs:
     - `http://localhost:5173` (Vite desarrollo)
   - Click en **Create**

3. **Copiar Client ID:**
   - Se mostrará un popup con tu **Client ID**
   - Cópialo (algo como `111111111111-xxxxxxxxxxxxx.apps.googleusercontent.com`)

4. **Actualizar `.env`:**
   ```
   VITE_GOOGLE_CLIENT_ID=111111111111-xxxxxxxxxxxxx.apps.googleusercontent.com
   ```

---

## 3. Variables de entorno (`.env`)

Después de obtener las credenciales, tu archivo `.env` debería verse así:

```env
# Backend
VITE_API_URL=http://localhost:5000

# Cloudinary (Almacenamiento de imágenes)
VITE_CLOUDINARY_CLOUD_NAME=dzxxxxxxxx
VITE_CLOUDINARY_UPLOAD_PRESET=unsigned_preset

# Google OAuth 2.0
VITE_GOOGLE_CLIENT_ID=111111111111-xxxxxxxxxxxxx.apps.googleusercontent.com
```

⚠️ **IMPORTANTE:**
- No compartir el `.env` en Git
- Ya hay un `.gitignore` que lo excluye
- El `.env.example` muestra la estructura

---

## 4. Instalar dependencias

```bash
cd c:\Users\Anrid\plomaap_react_estable
npm install
```

Esto instalará `@react-oauth/google` que se agregó a `package.json`

---

## 5. Iniciar el proyecto

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd ..
npm run dev
```

---

## 6. Flujo de funcionamiento

### Upload de imagen:
1. Usuario selecciona imagen en formulario de registro
2. Se muestra preview
3. La imagen se sube a Cloudinary automáticamente
4. Se obtiene URL segura
5. URL se guarda en el backend (db.json)
6. Avatar aparece en ClientDashboard

### Google Login:
1. Usuario hace click en "Sign in with Google"
2. Se abre popup de Google
3. Si es primer login: se crea automáticamente cuenta
4. Si ya existe: inicia sesión normalmente
5. Avatar de Google se guarda automáticamente

---

## 7. Archivos modificados

- `.env` - Variables de entorno
- `.env.example` - Plantilla de ejemplo
- `package.json` - Agregada dependencia `@react-oauth/google`
- `src/pages/Auth.jsx` - Agregado upload de imagen y Google Login
- `src/App.jsx` - Agregado GoogleOAuthProvider
- `src/styles/auth.css` - Estilos para imagen y Google login
- `backend/server.js` - Aceptar campo `avatar` en registro
- `backend/db.json` - Avatar URLs para usuarios de prueba

---

## 8. Troubleshooting

**Error: "VITE_CLOUDINARY_CLOUD_NAME is undefined"**
- Verificar que `.env` exista en la raíz del proyecto
- Reiniciar el servidor de desarrollo (`npm run dev`)

**Error: "Google Login no funciona"**
- Verificar que `VITE_GOOGLE_CLIENT_ID` sea correcto
- Confirmar que `localhost:5173` esté en authorized origins en Google Cloud
- Limpiar cookies del navegador

**Error: "Imagen no sube a Cloudinary"**
- Verificar que `VITE_CLOUDINARY_UPLOAD_PRESET` sea "unsigned"
- Confirmar que está creado en Cloudinary dashboard

---

Creado: 2024-12-10
