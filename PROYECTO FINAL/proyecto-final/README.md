# 📋 Gestor de Tareas - Proyecto Full Stack

Una aplicación completa de gestión de tareas con autenticación JWT avanzada, roles de usuario, paginación, integración de API externa y panel de administración.

## 🚀 Características principales

### Backend
- ✅ Autenticación JWT con roles (admin/user)
- ✅ Middleware de validación de datos
- ✅ Middleware personalizado de manejo de errores
- ✅ CRUD completo con paginación y filtros
- ✅ Autorización basada en roles
- ✅ Integración con API de clima (OpenWeather)
- ✅ Panel de administración
- ✅ Pruebas unitarias con Jest
- ✅ Manejo seguro de contraseñas con bcrypt

### Frontend
- ✅ React con React Router para navegación dinámica
- ✅ Autenticación y gestión de sesiones
- ✅ Interfaz responsiva y moderna
- ✅ Dashboard con búsqueda y filtros
- ✅ Panel de administrador
- ✅ Widget de clima en tiempo real
- ✅ Componentes reutilizables

## 📁 Estructura del Proyecto

```
proyecto-final/
├── backend/
│   ├── server.js
│   ├── middleware/
│   │   ├── auth.js (autenticación y autorización)
│   │   ├── validacion.js (validación de datos)
│   │   └── errorHandler.js (manejo de errores)
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── tareas.test.js
│   ├── package.json
│   └── .env.example
└── frontend/ (React)
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Admin.jsx
    │   ├── components/
    │   │   ├── TareaForm.jsx
    │   │   ├── TareaList.jsx
    │   │   └── Clima.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── styles/
    │       ├── Auth.css
    │       ├── Dashboard.css
    │       └── Admin.css
    └── index.html
```

## 🛠️ Instalación y configuración

### Requisitos
- Node.js 16+
- MongoDB
- npm o yarn

### Pasos para instalar

1. **Clonar el repositorio y entrar al directorio**
```bash
cd proyecto-final
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Instalar dependencias del backend**
```bash
npm install
```

4. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
cd ..
```

## 🚀 Ejecutar la aplicación

### Modo desarrollo

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### En producción

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🔐 Autenticación y Autorización

### Registro (POST /api/auth/register)
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "nombre": "Juan Pérez"
}
```

### Login (POST /api/auth/login)
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "...",
    "email": "usuario@example.com",
    "nombre": "Juan Pérez",
    "rol": "user"
  }
}
```

## 📝 Endpoints TAREAS

### Listar tareas (GET /api/tareas)
**Headers requeridos:** `Authorization: Bearer {token}`

**Query parameters:**
- `pagina`: número de página (default: 1)
- `limite`: tareas por página (default: 10, máx: 100)
- `busqueda`: filtrar por título
- `completada`: true/false para filtrar por estado

**Respuesta:**
```json
{
  "tareas": [...],
  "paginacion": {
    "pagina": 1,
    "limite": 10,
    "total": 25,
    "páginas": 3
  }
}
```

### Crear tarea (POST /api/tareas)
```json
{
  "titulo": "Mi tarea",
  "descripcion": "Descripción opcional"
}
```

### Actualizar tarea (PUT /api/tareas/{id})
```json
{
  "titulo": "Título actualizado",
  "descripcion": "Nueva descripción",
  "completada": true
}
```

### Eliminar tarea (DELETE /api/tareas/{id})

## 🌤️ API de Clima

### Obtener clima (GET /api/clima/{ciudad})
**Headers requeridos:** `Authorization: Bearer {token}`

**Respuesta:**
```json
{
  "ciudad": "Madrid",
  "pais": "ES",
  "temperatura": 22.5,
  "sensacion": 21.0,
  "humedad": 65,
  "descripcion": "Parcialmente nublado",
  "viento": 5.2
}
```

## 👥 APIs de Administrador

### Listar usuarios (GET /api/admin/usuarios)
(Requiere rol admin)

### Cambiar rol de usuario (PUT /api/admin/usuarios/{id}/rol)
(Requiere rol admin)
```json
{
  "rol": "admin"
}
```

### Desactivar usuario (DELETE /api/admin/usuarios/{id})
(Requiere rol admin)

## 🧪 Pruebas

### Ejecutar pruebas
```bash
npm test
```

### Cobertura de pruebas
```bash
npm test -- --coverage
```

### Tipos de pruebas incluidas:
- ✅ Pruebas unitarias de autenticación
- ✅ Pruebas de validación de datos
- ✅ Pruebas de autorización por roles
- ✅ Pruebas de seguridad (hashing, tokens)
- ✅ Pruebas de paginación
- ✅ Pruebas de CRUD de tareas

## 🔒 Seguridad

### Implementado:
- 🔐 Hash de contraseñas con bcrypt (10 rondas)
- 🔐 JWT con expiración (24 horas)
- 🔐 Validación de datos en todas las rutas
- 🔐 Autorización basada en roles
- 🔐 CORS configurado
- 🔐 Middleware de manejo de errores
- 🔐 Protección contra inyecciones
- 🔐 Aislamiento de datos por usuario

## 📦 Dependencias principales

### Backend
- Express 5.2.1
- MongoDB/Mongoose 9.1.5
- JWT (jsonwebtoken) 9.0.3
- Bcrypt 3.0.3
- Axios (consumo de APIs) 1.6.2

### Frontend
- React 18.2.0
- React Router DOM 6.14.0
- Vite (built-in)

## 🐛 Debugging

### Backend
```bash
# Activar modo debug
DEBUG=* npm run dev

# Utilizar inspector de Node.js
node --inspect server.js
```

### Frontend
- Usar DevTools de navegador (F12)
- React DevTools extension

## 🚢 Despliegue

### Opción 1: Heroku
```bash
heroku create tu-app
heroku addons:create mongolab:sandbox
git push heroku main
```

### Opción 2: Render
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push

### Opción 3: DigitalOcean
1. Crear droplet con Node.js
2. Clonar repositorio
3. Configurar PM2 para mantener el proceso activo

## 📚 Recursos adicionales

- [Documentación Express](https://expressjs.com/)
- [Documentación React](https://react.dev/)
- [JWT.io](https://jwt.io/)
- [OpenWeather API](https://openweathermap.org/api)

## 👨‍💻 Autor

Proyecto finalizado: Febrero 2026

## 📄 Licencia

ISC
