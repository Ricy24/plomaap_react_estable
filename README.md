# Proyecto plomapp

https://drive.google.com/file/d/1SUNLHGfq4O8-75DAKvXZ-XIPN06FSzqJ/view?usp=drivesdk

# DIAPOSITIVAS
Formato IEEE https://github.com/Plomaap/Plomaap/blob/main/Formato%20ERS%20PlomApp.docx
https://canva.link/51tcdw06jat6pi3

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# PlomApp React + Flask

## Requisitos previos

Antes de ejecutar el proyecto, asegúrese de tener instalado:

- Git
- Python 3.x
- Node.js
- MySQL Server
- MySQL Workbench

---

## 1. Clonar el repositorio

Abra Git Bash y ejecute:

```bash
git clone https://github.com/Ricy24/plomaap_react_estable.git
cd plomaap_react_estable
```

---

## 2. Configuración del Backend (Flask)

### Ingresar a la carpeta del backend

```bash
cd backend_flask
```

### Crear el entorno virtual

```bash
python -m venv venv
```

### Activar el entorno virtual

```bash
source venv/Scripts/activate
```

Si la activación fue correcta, aparecerá `(venv)` al inicio de la terminal.

### Instalar las dependencias

```bash
pip install -r requirements.txt
```

### Configurar variables de entorno

Copie el archivo `.env.example` y renómbrelo como `.env`.

Configure las variables necesarias para la conexión a la base de datos:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=tu_contraseña
MYSQL_DB=plomaap
JWT_SECRET_KEY=tu_clave_secreta
```

### Crear la base de datos

Desde MySQL Workbench ejecute:

```sql
CREATE DATABASE plomaap;
```

### Poblar la base de datos (si aplica)

Si el proyecto incluye un archivo `seed.py`, ejecute:

```bash
python seed.py
```

### Ejecutar el backend

```bash
python run.py
```

El servidor Flask quedará ejecutándose en una dirección similar a:

```text
http://localhost:5000
```

---

## 3. Configuración del Frontend (React + Vite)

Abra una nueva terminal Git Bash.

Ubíquese nuevamente en la raíz del proyecto:

```bash
cd plomaap_react_estable
```

### Instalar dependencias

```bash
npm install
```

### Ejecutar el frontend

```bash
npm run dev
```

El proyecto quedará disponible en una dirección similar a:

```text
http://localhost:5173
```

---

## 4. Ejecución diaria del proyecto

### Iniciar Backend

```bash
cd backend_flask
source venv/Scripts/activate
python run.py
```

### Iniciar Frontend

En otra terminal:

```bash
cd plomaap_react_estable
npm run dev
```

---

## Comandos útiles

### Activar entorno virtual

```bash
source venv/Scripts/activate
```

### Desactivar entorno virtual

```bash
deactivate
```

### Instalar nuevas dependencias de Python

```bash
pip install nombre_paquete
```

### Actualizar requirements.txt

```bash
pip freeze > requirements.txt
```

### Instalar nuevas dependencias de React

```bash
npm install nombre-paquete
```

---

## Tecnologías utilizadas

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- Flask
- SQLAlchemy
- JWT

### Base de datos

- MySQL
- MySQL Workbench

### Control de versiones

- Git
- GitHub

---

## Notas

- Mantenga siempre el entorno virtual activado mientras trabaje en el backend.
- El backend y el frontend deben ejecutarse en terminales separadas.
- Verifique que MySQL esté en ejecución antes de iniciar el backend.
- Si es la primera vez que ejecuta el proyecto, asegúrese de configurar correctamente el archivo `.env`.
