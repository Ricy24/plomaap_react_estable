# Pruebas del frontend PlomApp

## Unitarias (Vitest)

```powershell
npm install
npm run test:unit
```

- `tests/unit/unit_05_validation.test.js` cubre las validaciones de
  `src/utils/validation.js` (email, nombre, teléfono, contraseña, registro y
  login).
- Configuración: `vitest.config.js` con entorno `jsdom`.

## E2E (Playwright)

```powershell
npx playwright install chromium
$env:E2E_BASE_URL='http://127.0.0.1:5173'
$env:E2E_CLIENT_EMAIL='...'
$env:E2E_CLIENT_PASSWORD='...'
$env:E2E_TECHNICIAN_EMAIL='...'
$env:E2E_TECHNICIAN_PASSWORD='...'
$env:E2E_ADMIN_EMAIL='...'
$env:E2E_ADMIN_PASSWORD='...'
npm run test:e2e
```

Los specs están en `e2e/tests/` y conservan los IDs `E2E-01`, `E2E-02` y
`E2E-03`. Si faltan credenciales, Playwright los marca como `skipped`; no se
reportan como exitosos.
