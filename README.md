# PlomApp Frontend

Interfaz web de PlomApp para agendar, gestionar y dar seguimiento a servicios de
plomería. Consume la API Django del repositorio
[plomaap_django](https://github.com/Ricy24/plomaap_django) y mantiene el mismo
contrato de endpoints, códigos de estado y formato JSON.

## Stack

- React 19 + Vite 8
- React Router 7
- Vitest + jsdom para pruebas unitarias
- Playwright para pruebas E2E
- ESLint 10

## Requisitos

- Node.js **>= 20.19.0** (recomendado 22 LTS, ver `.nvmrc`)
- npm 10+
- Backend Django corriendo en `http://localhost:5000` para desarrollo

## Inicio rápido

```bash
npm ci
cp .env.example .env
# edita .env con tus valores locales
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### Variables de entorno

Todas las variables del frontend son públicas por diseño (Vite las incrusta en
el bundle). No guardes secretos de servidor en este repositorio.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | Recomendada | URL base del API. Si está vacía se usa el mismo origen (proxy `/api`). |
| `VITE_GEOCODING_API` | No | Endpoint de Nominatim. Por defecto usa OpenStreetMap. |
| `VITE_CLOUDINARY_CLOUD_NAME` | Para fotos | Cloud name de Cloudinary. |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Para fotos | Upload preset (unsigned) de Cloudinary. |
| `VITE_GOOGLE_CLIENT_ID` | Para Google Login | Client ID OAuth 2.0. |

`.env` está ignorado por Git. Usa `.env.example` como plantilla.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Build de producción en `dist/`. |
| `npm run preview` | Sirve el build localmente en `http://localhost:4173`. |
| `npm run lint` | Analiza todo el código con ESLint. |
| `npm run lint:fix` | Corrige automáticamente lo que ESLint pueda. |
| `npm run test:unit` | Ejecuta Vitest una vez. |
| `npm run test:unit:watch` | Vitest en modo watch. |
| `npm run test:e2e` | Playwright (requiere backend y credenciales E2E). |
| `npm run check` | Lint + pruebas unitarias + build. |

## Estructura

```text
.
├── e2e/                 # Configuración y specs de Playwright
├── public/              # Assets estáticos servidos en /
├── src/
│   ├── assets/          # Imágenes importadas por el bundle
│   ├── components/      # Componentes reutilizables
│   ├── config/          # Variables de entorno centralizadas
│   ├── context/         # Autenticación y sesión
│   ├── hooks/           # Hooks compartidos
│   ├── pages/           # Vistas por rol (cliente, técnico, admin)
│   ├── services/        # Cliente HTTP y normalización de respuestas
│   ├── styles/          # CSS por módulo
│   └── utils/           # Utilidades (Cloudinary, perfiles, etc.)
├── tests/unit/          # Pruebas unitarias (Vitest)
├── .env.example
├── eslint.config.js
├── vite.config.js
└── vitest.config.js
```

## Pruebas

### Unitarias

```bash
npm run test:unit
```

Cubren validaciones de formularios y normalización de respuestas del API. No
necesitan backend ni base de datos.

### E2E

1. Levanta el backend Django y su base de datos sembrada.
2. Define las credenciales de prueba:

```bash
E2E_CLIENT_EMAIL=cliente@ejemplo.com
E2E_CLIENT_PASSWORD=...
E2E_TECHNICIAN_EMAIL=tecnico@ejemplo.com
E2E_TECHNICIAN_PASSWORD=...
E2E_ADMIN_EMAIL=admin@ejemplo.com
E2E_ADMIN_PASSWORD=...
```

3. Ejecuta:

```bash
npm run test:e2e
```

Playwright levanta el frontend automáticamente en `http://127.0.0.1:5173` si no
existe un servidor. Si usas una URL distinta, define `E2E_BASE_URL`. Los specs se
saltan de forma limpia cuando faltan credenciales.

## Producción

```bash
npm ci
npm run check
npm run build
```

Sirve el contenido de `dist/` con un servidor estático y configura fallback de
SPA hacia `index.html` para que funcionen las rutas de React Router.

Ejemplo Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Si el frontend y el API comparten dominio, configura un proxy para `/api` y deja
`VITE_API_URL` vacía. Si están en dominios distintos, define la URL completa y
habilita CORS en el backend.

## Ramas

- `production`: versión estable desplegable.
- `andres_dev`: integración y desarrollo de Andrés.
- `main`: historial base del repositorio.

Los cambios se integran desde `andres_dev` hacia `production` mediante merge y
tag de versión.

## Recursos del proyecto

- [Video de presentación](https://drive.google.com/file/d/1SUNLHGfq4O8-75DAKvXZ-XIPN06FSzqJ/view?usp=drivesdk)
- [Formato ERS PlomApp](https://github.com/Plomaap/Plomaap/blob/main/Formato%20ERS%20PlomApp.docx)
- [Diapositivas en Canva](https://canva.link/51tcdw06jat6pi3)

## Seguridad

- No se versionan `.env`, backups, `venv`, `node_modules`, `dist` ni artefactos
  de pruebas.
- Los backends legacy de Flask/Node que vivían dentro de este repositorio fueron
  retirados; la API oficial es el proyecto Django.
- Si detectas una credencial real expuesta, rótala en el proveedor
  correspondiente. Las variables `VITE_*` son visibles en el navegador.

## Solución de problemas

- **Google Login: “The given origin is not allowed”**: agrega
  `http://localhost:5173` (y el dominio de producción) en *Authorized JavaScript
  origins* del Client ID en Google Cloud Console.
- **Error de conexión con el API**: verifica `VITE_API_URL`, que el backend esté
  corriendo y que CORS permita el origen del frontend.
- **Las fotos no suben**: revisa `VITE_CLOUDINARY_CLOUD_NAME` y
  `VITE_CLOUDINARY_UPLOAD_PRESET`; el preset debe ser unsigned.
- **Playwright no encuentra Chromium**: ejecuta
  `npx playwright install chromium`.
