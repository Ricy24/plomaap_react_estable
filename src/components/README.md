# Componentes PlomApp

Este directorio contiene todos los componentes reutilizables de la aplicación.

## 📋 Componentes Disponibles

### Header
**Archivo:** `Header.jsx`

**Descripción:** Encabezado principal de la landing page con logo, navegación y botones de autenticación.

**Props:**
- `onLogin` (function): Callback ejecutado al hacer clic en "Ingresar" o "Pedir Servicio"

**Uso:**
```jsx
import Header from '../components/Header'

function Home({ onLogin }) {
  return (
    <div>
      <Header onLogin={onLogin} />
      {/* resto del contenido */}
    </div>
  )
}
```

**Estilos:** Se encuentran en `src/styles/landing.css` bajo la clase `.elegant-header`

**Elementos:**
- Logo con dot animado
- Navegación con 4 enlaces (Inicio, El Proceso, Seguridad, Para Técnicos)
- Botones de "Ingresar" y "Pedir Servicio"

---

### HeroSection
**Archivo:** `HeroSection.jsx`

**Descripción:** Sección principal con el buscador de servicios y las opciones de servicios (Fugas, Destapes, Instalaciones, Mantenimiento).

**Props:**
- `onLogin` (function): Callback ejecutado al hacer clic en el botón "Buscar"

**Uso:**
```jsx
import HeroSection from '../components/HeroSection'

function Home({ onLogin }) {
  return (
    <div>
      <Header onLogin={onLogin} />
      <HeroSection onLogin={onLogin} />
      {/* resto del contenido */}
    </div>
  )
}
```

**Estilos:** Se encuentran en `src/styles/landing.css` bajo las clases:
- `.hero-elegant`
- `.hero-content`
- `.search-card-elegant`
- `.services-row`

**Elementos:**
- Título heroico
- Input de búsqueda con ícono de localización
- Botón de búsqueda
- Pills con iconos de servicios (Fugas, Destapes, Instalaciones, Mantenimiento)

---

## 🔧 Cómo Modificar el Header

### 1. Cambiar el logo
En `Header.jsx`, modifica:
```jsx
<div className="header-logo">
  <div className="logo-dot"></div>
  <span>PlomApp</span>  {/* Cambia este texto */}
</div>
```

### 2. Agregar nuevos links de navegación
```jsx
<nav className="header-nav">
  <a href="#inicio">Inicio</a>
  <a href="#nuevo">Tu nuevo link</a>  {/* Agrega aquí */}
  {/* ... resto */}
</nav>
```

### 3. Cambiar estilos del header
Abre `src/styles/landing.css` y busca `.elegant-header` para personalizar:
- Color de fondo
- Altura
- Espaciado
- Colores de texto
- etc.

### 4. Agregar funcionalidad
Por ejemplo, para cerrar sesión desde el header:
```jsx
function Header({ onLogin, onLogout }) {
  return (
    <header className="elegant-header">
      {/* ... */}
      <div className="header-auth">
        <button onClick={onLogout}>Cerrar Sesión</button>
      </div>
    </header>
  )
}
```

---

## 📦 Próximos Componentes a Crear

- [ ] ProcessSection (Sección "Cómo Funciona")
- [ ] TrustSection (Sección "Seguridad Ante Todo")
- [ ] TechnicianSection (Sección "Para Técnicos")
- [ ] Footer
- [ ] SearchBox (como componente independiente)
- [ ] ServiceCard
- [ ] TrustBadge

---

## 📝 Notas

- Todos los componentes usan CSS de `src/styles/landing.css`
- Los iconos usan Font Awesome (asegúrate de que está importado en `index.html`)
- Los componentes son funcionales (hooks de React)

