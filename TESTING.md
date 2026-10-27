# Pruebas del frontend PlomApp

## Unitarias (Vitest)

```powershell
npm ci
npm run test:unit
```

- `tests/unit/unit_05_validation.test.js` cubre las validaciones de
  `src/utils/validation.js` (email, nombre, teléfono, contraseña, registro y
  login).
- `tests/unit/api_normalizers.test.js` cubre la normalización de técnicos,
  citas y slots del API.
- Configuración: `vitest.config.js` con entorno `jsdom`.

## Verificación completa

```powershell
npm run check
```

Ejecuta ESLint, las pruebas unitarias y el build de producción. Es el comando
recomendado antes de abrir un pull request o desplegar.

## E2E (Playwright)

```powershell
npx playwright install chromium
$env:E2E_CLIENT_EMAIL='...'
$env:E2E_CLIENT_PASSWORD='...'
$env:E2E_TECHNICIAN_EMAIL='...'
$env:E2E_TECHNICIAN_PASSWORD='...'
$env:E2E_ADMIN_EMAIL='...'
$env:E2E_ADMIN_PASSWORD='...'
npm run test:e2e
```

Playwright levanta el frontend automáticamente en `http://127.0.0.1:5173`.
Define `E2E_BASE_URL` solo si vas a usar un servidor ya desplegado. El backend
Django y su base de datos deben estar disponibles.

Los specs están en `e2e/tests/` y conservan los IDs `E2E-01`, `E2E-02` y
`E2E-03`. Si faltan credenciales, Playwright los marca como `skipped`; no se
reportan como exitosos.
