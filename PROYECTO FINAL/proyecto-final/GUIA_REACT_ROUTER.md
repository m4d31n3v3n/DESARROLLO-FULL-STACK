# 🛣️ Guía: Rutas Dinámicas con React Router

## ¿Qué es React Router?

React Router es una biblioteca que permite crear navegación entre múltiples vistas/páginas en una aplicación React sin recargar la página (Single Page Application).

## Instalación

```bash
npm install react-router-dom
```

## Concepto Básico

### Sin React Router (Antiguo)
```javascript
// ❌ Recarga la página entera
<a href="/dashboard">Dashboard</a>
```

### Con React Router (Moderno)
```javascript
// ✅ Cambia de vista sin recargar
<Link to="/dashboard">Dashboard</Link>
```

## Estructura de Rutas

### 1. Configurar Router en App.jsx

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
```

## Rutas Protegidas (con Autenticación)

### 1. Crear Componente de Ruta Protegida

```javascript
// components/RutaProtegida.jsx
import { Navigate } from 'react-router-dom';

function RutaProtegida({ 
    children, 
    requiereLogin = true, 
    rolRequerido = null,
    usuario = null 
}) {
    // Si requiere login y no hay usuario
    if (requiereLogin && !usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si requiere rol específico
    if (rolRequerido && usuario?.rol !== rolRequerido) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default RutaProtegida;
```

### 2. Usar en App.jsx

```javascript
import RutaProtegida from './components/RutaProtegida';

function App() {
    const [usuario, setUsuario] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route 
                    path="/dashboard" 
                    element={
                        <RutaProtegida requiereLogin={true} usuario={usuario}>
                            <Dashboard />
                        </RutaProtegida>
                    } 
                />
                
                <Route 
                    path="/admin" 
                    element={
                        <RutaProtegida 
                            requiereLogin={true} 
                            rolRequerido="admin" 
                            usuario={usuario}
                        >
                            <Admin />
                        </RutaProtegida>
                    } 
                />
            </Routes>
        </Router>
    );
}
```

## Rutas Dinámicas

### 1. Ruta con Parámetros

```javascript
<Route path="/tareas/:id" element={<TareaDetalle />} />

// Página: tareas/123
// tareas/456
```

### 2. Leer Parámetro en Componente

```javascript
import { useParams } from 'react-router-dom';

function TareaDetalle() {
    const { id } = useParams();
    
    return <h1>Tarea: {id}</h1>;
}
```

### 3. Ejemplo Completo

```javascript
// App.jsx
<Routes>
    <Route path="/tareas/:id" element={<TareaDetalle />} />
    <Route path="/usuarios/:usuarioId/tareas/:tareaId" element={<VerTarea />} />
</Routes>

// pages/TareaDetalle.jsx
function TareaDetalle() {
    const { id } = useParams();
    const [tarea, setTarea] = useState(null);

    useEffect(() => {
        fetch(`/api/tareas/${id}`)
            .then(res => res.json())
            .then(setTarea);
    }, [id]);

    if (!tarea) return <div>Cargando...</div>;

    return (
        <div>
            <h1>{tarea.titulo}</h1>
            <p>{tarea.descripcion}</p>
        </div>
    );
}
```

## Navegación Programática

### 1. useNavigate Hook

```javascript
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            // Navegar después de login exitoso
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin(email, password);
        }}>
            {/* Form fields */}
        </form>
    );
}
```

### 2. Navegar a Ruta Anterior

```javascript
function Volcar() {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)}>
            ← Volver
        </button>
    );
}
```

## Navegación con Link

### 1. Link Básico

```javascript
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/admin">Admin</Link>
        </nav>
    );
}
```

### 2. Link a Ruta Dinámica

```javascript
<Link to={`/tareas/${tarea._id}`}>
    Ver Tarea
</Link>

<Link to={`/usuarios/${usuario.id}/perfil`}>
    Mi Perfil
</Link>
```

## Query Parameters

### 1. Pasar Parámetros de Consulta

```javascript
import { useSearchParams } from 'react-router-dom';

// URL: /tareas?pagina=2&filtro=completada

function Tareas() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const pagina = searchParams.get('pagina') || 1;
    const filtro = searchParams.get('filtro') || 'todas';

    const handleCambiarPagina = (nuevaPagina) => {
        setSearchParams({ pagina: nuevaPagina, filtro });
    };

    return (
        <div>
            <p>Página: {pagina}, Filtro: {filtro}</p>
            <button onClick={() => handleCambiarPagina(2)}>
                Ir a Página 2
            </button>
        </div>
    );
}
```

## Nested Routes (Rutas Anidadas)

### 1. Estructura de Admin con Sub-rutas

```javascript
function App() {
    return (
        <Routes>
            <Route path="/admin" element={<AdminLayout />}>
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="tareas" element={<Tareas />} />
                <Route path="reportes" element={<Reportes />} />
            </Route>
        </Routes>
    );
}

// components/AdminLayout.jsx
import { Outlet, Link } from 'react-router-dom';

function AdminLayout() {
    return (
        <div className="admin-layout">
            <aside>
                <Link to="usuarios">Usuarios</Link>
                <Link to="tareas">Tareas</Link>
                <Link to="reportes">Reportes</Link>
            </aside>
            <main>
                <Outlet /> {/* Aquí se renderiza la ruta seleccionada */}
            </main>
        </div>
    );
}
```

## Lazy Loading (Carga Perezosa)

```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Suspense>
    );
}
```

## Listener de Cambio de Ruta

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function App() {
    const location = useLocation();

    useEffect(() => {
        // Se ejecuta cada vez que cambia la ruta
        console.log('Ruta actual:', location.pathname);
    }, [location]);

    return <Routes>{/* ... */}</Routes>;
}
```

## Manejo de 404

```javascript
function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found">
            <h1>404 - Página no encontrada</h1>
            <p>La página que buscas no existe.</p>
            <button onClick={() => navigate('/dashboard')}>
                Volver al Dashboard
            </button>
        </div>
    );
}

// En App.jsx
<Routes>
    {/* Todas las demás rutas */}
    <Route path="*" element={<NotFound />} />
</Routes>
```

## Estado Global con Context + Router

```javascript
// App.jsx
import { AuthContext, AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
    const [usuario] = useContext(AuthContext);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route 
                    path="/dashboard" 
                    element={
                        <RutaProtegida>
                            <Dashboard user={usuario} />
                        </RutaProtegida>
                    } 
                />
            </Routes>
        </Router>
    );
}
```

## Ejemplo Completo Integrado

```javascript
// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import RutaProtegida from './components/RutaProtegida';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route 
                        path="/dashboard" 
                        element={
                            <RutaProtegida>
                                <Dashboard />
                            </RutaProtegida>
                        } 
                    />
                    
                    <Route 
                        path="/admin" 
                        element={
                            <RutaProtegida rolRequerido="admin">
                                <Admin />
                            </RutaProtegida>
                        } 
                    />
                    
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
