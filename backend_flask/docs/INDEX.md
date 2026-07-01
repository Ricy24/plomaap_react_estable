# Documentación - PlomApp Backend

**Índice completo de documentación del backend Flask.**

---

## Para Empezar (Haz esto primero)

| Documento | Lectura | Propósito |
|-----------|---------|-----------|
| **[INSTALL_QUICK.md](INSTALL_QUICK.md)** | 5 min | Instalación paso a paso |
| **[STRUCTURE.md](STRUCTURE.md)** | 10 min | Entender la estructura del proyecto |

---

## Documentación Principal

### Conceptos y Diseño
- **[STRUCTURE.md](STRUCTURE.md)** - Estructura modular del backend
  - Descripción de cada carpeta
  - Patrones de diseño
  - Flujo de la aplicación

- **[BACKEND_DESIGN.md](BACKEND_DESIGN.md)** - Especificación técnica completa
  - Modelos de BD detallados
  - Endpoints con ejemplos
  - Lógica de negocio
  - Seguridad implementada

- **[ARCHITECTURE_FLOWS.md](ARCHITECTURE_FLOWS.md)** - Diagramas y flujos
  - Flujos de autenticación
  - Flujos de citas
  - Interacciones entre componentes

### Configuración e Instalación
- **[INSTALL_QUICK.md](INSTALL_QUICK.md)** - Guía de instalación
  - Setup MySQL
  - Configurar variables de entorno
  - Instalar dependencias
  - Ejecutar servidor

- **[MIGRATION.md](MIGRATION.md)** - Migración de v1.0 a v2.0
  - Qué cambió
  - Cómo actualizar imports
  - Cambios en ejecución

### Referencia Rápida
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Referencia rápida
  - Endpoints por categoría
  - Comandos de desarrollo
  - Validaciones críticas
  - Ejemplos de curl

---

## Información del Proyecto

- **[BUILD_COMPLETE.md](BUILD_COMPLETE.md)** - Resumen de implementación
  - Estadísticas de código
  - Características implementadas
  - Checklist final

- **[REFACTORING_COMPLETE.md](REFACTORING_COMPLETE.md)** - Cambios en refactorización
  - Antes vs después
  - Ventajas de la nueva estructura
  - Verificación de integridad

---

## Documentación Técnica Adicional

- **[IMPLEMENTATION_SKELETON.md](IMPLEMENTATION_SKELETON.md)** - Esquemas de implementación
  - Estructura de código
  - Ejemplos de controladores
  - Ejemplos de servicios

---

## Flujo de Lectura Recomendado

### **Para Nuevos en el Proyecto:**
1. Lee **README.md** (raíz) - Visión general
2. Lee **INSTALL_QUICK.md** - Cómo instalar
3. Lee **STRUCTURE.md** - Cómo está organizado
4. Explora el código en `app/`

### **Para Desarrolladores:**
1. Lee **STRUCTURE.md** - Entender arquitectura
2. Lee **BACKEND_DESIGN.md** - Especificación técnica
3. Lee **QUICK_REFERENCE.md** - Endpoints rápidamente
4. Consulta **ARCHITECTURE_FLOWS.md** - Para flujos complejos

### **Para DevOps/Deployment:**
1. Lee **INSTALL_QUICK.md** - Setup
2. Consulta variables en `.env.example`
3. Lee **BACKEND_DESIGN.md** - Requerimientos
4. Configura MySQL según **BACKEND_DESIGN.md**

---

## 📋 Contenido por Documento

### STRUCTURE.md
```
├─ Descripción de cada carpeta
├─ Patrones de diseño
├─ Importes principales
├─ Comparación antes/después
└─ Próximos pasos
```

### INSTALL_QUICK.md
```
├─ Requisitos
├─ Setup paso a paso
├─ Configurar MySQL
├─ Instalar dependencias
├─ Ejecutar servidor
└─ Troubleshooting
```

### QUICK_REFERENCE.md
```
├─ Endpoints rápida
├─ Modelos resumidos
├─ Comandos development
├─ Variables de entorno
└─ Validaciones críticas
```

### BACKEND_DESIGN.md
```
├─ Especificación completa
├─ Modelos con relaciones
├─ Endpoints detallados
├─ Ejemplos de requests/responses
├─ Lógica de negocio
└─ Configuración MySQL
```

### ARCHITECTURE_FLOWS.md
```
├─ Diagrama de flujo de auth
├─ Flujo de citas
├─ Interacciones entre componentes
├─ Máquinas de estado
└─ Secuencias de operaciones
```

---

## 🔗 Enlaces Rápidos

### Folders
- 📂 [app/](../app/) - Código fuente
- 📂 [app/routes/](../app/routes/) - 24 endpoints
- 📂 [app/database/](../app/database/) - Models & ORM
- 📂 [app/utils/](../app/utils/) - Utilities compartidas

### Archivos Raíz
- 🐍 [run.py](../run.py) - Punto de entrada
- ⚙️ [.env.example](../.env.example) - Variables de entorno
- 📋 [requirements.txt](../requirements.txt) - Dependencias

---

## ✨ Resumen Ejecutivo

**PlomApp Backend** es una API REST completa construida con:

- **Framework:** Flask 2.3.0
- **BD:** MySQL + SQLAlchemy ORM
- **Auth:** JWT Extended (4.4.0)
- **Security:** bcrypt + CORS + Validación
- **Endpoints:** 24 total
- **Modelos:** 5 (User, TechnicianProfile, Service, Appointment, Device)
- **Estructura:** Modular y escalable

### Características Principales
✅ Autenticación JWT  
✅ 3 roles (customer, technician, admin)  
✅ Sistema de disponibilidad de técnicos  
✅ Gestión completa de citas  
✅ Dashboard administrativo  
✅ Validación y error handling centralizados  

---

## 🆘 Necesitas Ayuda?

1. **¿Cómo instalo?** → [INSTALL_QUICK.md](INSTALL_QUICK.md)
2. **¿Cómo funciona?** → [STRUCTURE.md](STRUCTURE.md)
3. **¿Qué endpoints hay?** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
4. **¿Detalles técnicos?** → [BACKEND_DESIGN.md](BACKEND_DESIGN.md)
5. **¿Flujos visuales?** → [ARCHITECTURE_FLOWS.md](ARCHITECTURE_FLOWS.md)

---

**Última actualización:** 2026-06-29  
**Versión:** 2.0 (Modular)
