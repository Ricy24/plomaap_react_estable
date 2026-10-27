# Changelog

Todas las versiones relevantes de PlomApp Frontend.

## [1.0.1] - 2026-10-27

### Correcciones

- Las credenciales de demostración (CP06/CP07) solo se muestran en desarrollo;
  ya no aparecen en el build de producción.
- Google Login se renderiza únicamente cuando `VITE_GOOGLE_CLIENT_ID` está
  configurado. La aplicación sigue funcionando con correo y contraseña.
- Se actualizó la versión del paquete y el lockfile.

## [1.0.0] - 2026-10-27

### Cambios principales

- Se retiraron del repositorio los backends legacy (`backend`, `backend_flask` y
  `backend_lomap`). La API oficial es el proyecto Django.
- Se eliminó `.env` del control de versiones y se reforzó `.gitignore`.
- Se centralizaron las variables de entorno en `src/config/env.js`.
- El cliente HTTP ahora maneja timeout, errores de red, sesión expirada y
  respuestas sin JSON.
- Se corrigió la geocodificación: endpoint configurable, sin cabeceras
  prohibidas por el navegador.
- Se corrigió el flujo de reprogramación de citas del cliente.
- Se limpiaron imports, estados y funciones sin uso.
- Se agregaron identificadores estables (`data-testid`) para pruebas E2E.

### Calidad

- Vitest: 10 pruebas unitarias aprobadas.
- Playwright: specs E2E-01, E2E-02 y E2E-03 listos; se saltan si faltan
  credenciales.
- ESLint sin errores ni advertencias.
- Build de producción verificado con Vite.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- CI de GitHub Actions para lint, pruebas, build y auditoría.

### Documentación

- README reescrito con instalación, variables, scripts, estructura, despliegue y
  solución de problemas.
- TESTING.md actualizado con comandos y alcance de las pruebas.

### Pendiente

- Ejecutar los flujos E2E completos contra una base de datos sembrada
  (`plomapp_e2e`) y registrar la evidencia en el plan SENA.
