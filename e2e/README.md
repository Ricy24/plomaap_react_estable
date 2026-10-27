# Pruebas E2E con Playwright

Requisitos:

1. Backend Django corriendo en `http://127.0.0.1:5001` (o el puerto configurado en el frontend).
2. Frontend Vite corriendo en `http://127.0.0.1:5173`.
3. Usuarios de prueba activos en la base de datos usada por ese backend.

Variables de entorno:

```powershell
$env:E2E_BASE_URL='http://127.0.0.1:5173'
$env:E2E_CLIENT_EMAIL='...'
$env:E2E_CLIENT_PASSWORD='...'
$env:E2E_TECHNICIAN_EMAIL='...'
$env:E2E_TECHNICIAN_PASSWORD='...'
$env:E2E_ADMIN_EMAIL='...'
$env:E2E_ADMIN_PASSWORD='...'
npm run test:e2e
```

Los casos se marcan como `skipped` si faltan las credenciales, para no inventar resultados ni ejecutar acciones contra datos reales sin autorización.
