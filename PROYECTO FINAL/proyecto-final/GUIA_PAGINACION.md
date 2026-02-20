# 📚 Guía de Implementación: Paginación con Express.js

## ¿Qué es la Paginación?

La paginación es una técnica para dividir grandes conjuntos de datos en partes más pequeñas (páginas) para mejorar el rendimiento y la experiencia del usuario.

## Implementación Backend

### 1. Middleware de Validación de Paginación

```javascript
const validarPaginacion = (req, res, next) => {
    const { pagina = 1, limite = 10 } = req.query;

    if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({ error: 'Número de página inválido.' });
    }

    if (isNaN(limite) || limite < 1 || limite > 100) {
        return res.status(400).json({ error: 'Límite debe estar entre 1 y 100.' });
    }

    req.paginacion = {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        saltar: (parseInt(pagina) - 1) * parseInt(limite)
    };

    next();
};
```

### 2. Aplicar en Rutas GET

```javascript
app.get('/api/tareas', verificarToken, validarPaginacion, async (req, res, next) => {
    try {
        const filtro = { usuarioId: req.user.id };

        // Contar total de documentos
        const total = await Tarea.countDocuments(filtro);

        // Obtener documentos paginados
        const tareas = await Tarea
            .find(filtro)
            .sort({ createdAt: -1 })
            .skip(req.paginacion.saltar)      // Saltar registros
            .limit(req.paginacion.limite)     // Limitar cantidad
            .select('-__v');

        res.json({
            tareas,
            paginacion: {
                pagina: req.paginacion.pagina,
                limite: req.paginacion.limite,
                total,
                páginas: Math.ceil(total / req.paginacion.limite)
            }
        });
    } catch (err) {
        next(err);
    }
});
```

### 3. Conceptos Clave

| Concepto | Descripción | Ejemplo |
|----------|-------------|---------|
| **pagina** | Número de página (comienza en 1) | pagina=2 |
| **limite** | Registros por página | limite=10 |
| **saltar** | Documentos a omitir (página - 1) * limite | saltar=10 |
| **total** | Número total de documentos | total=25 |
| **páginas** | Número total de páginas | páginas=3 |

## Implementación Frontend (React)

### 1. Hook de Paginación

```javascript
const [paginacion, setPaginacion] = useState({ 
    pagina: 1, 
    limite: 10,
    total: 0,
    páginas: 1
});
```

### 2. Llamada a API con Paginación

```javascript
const cargarTareas = async (pagina = 1) => {
    setLoading(true);
    try {
        const response = await fetch(
            `/api/tareas?pagina=${pagina}&limite=10`
        );
        const datos = await response.json();
        setTareas(datos.tareas);
        setPaginacion(datos.paginacion);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
};
```

### 3. Componente de Controles de Paginación

```javascript
import React from 'react';

function Paginacion({ paginacion, onCambiarPagina }) {
    return (
        <div className="paginacion">
            <button
                onClick={() => onCambiarPagina(Math.max(1, paginacion.pagina - 1))}
                disabled={paginacion.pagina === 1}
            >
                ← Anterior
            </button>
            
            <span>
                Página {paginacion.pagina} de {paginacion.páginas} 
                (Total: {paginacion.total})
            </span>
            
            <button
                onClick={() => onCambiarPagina(Math.min(paginacion.páginas, paginacion.pagina + 1))}
                disabled={paginacion.pagina === paginacion.páginas}
            >
                Siguiente →
            </button>
        </div>
    );
}

export default Paginacion;
```

## Ejemplo Completo en el Dashboard

### Backend
```javascript
// GET /api/tareas?pagina=2&limite=10&busqueda=importante
app.get('/api/tareas', verificarToken, validarPaginacion, async (req, res, next) => {
    try {
        const { busqueda = '' } = req.query;
        const filtro = { 
            usuarioId: req.user.id,
            titulo: { $regex: busqueda, $options: 'i' }
        };

        const total = await Tarea.countDocuments(filtro);
        const tareas = await Tarea
            .find(filtro)
            .sort({ createdAt: -1 })
            .skip(req.paginacion.saltar)
            .limit(req.paginacion.limite);

        res.json({
            tareas,
            paginacion: {
                pagina: req.paginacion.pagina,
                limite: req.paginacion.limite,
                total,
                páginas: Math.ceil(total / req.paginacion.limite)
            }
        });
    } catch (err) {
        next(err);
    }
});
```

### Frontend
```javascript
const [paginacion, setPaginacion] = useState({ pagina: 1, limite: 10 });

useEffect(() => {
    const params = new URLSearchParams({
        pagina: paginacion.pagina,
        limite: paginacion.limite
    });

    fetch(`/api/tareas?${params}`)
        .then(res => res.json())
        .then(datos => {
            setTareas(datos.tareas);
            setPaginacion(datos.paginacion);
        });
}, [paginacion.pagina]);

const handleCambiarPagina = (nuevaPagina) => {
    setPaginacion({
        ...paginacion,
        pagina: nuevaPagina
    });
};
```

## Mejores Prácticas

✅ **Validar siempre los parámetros de paginación**
✅ **Establecer límites máximos (ej: 100 registros por página)**
✅ **Usar índices en MongoDB para optimizar búsquedas**
✅ **Cachear resultados si es necesario**
✅ **Incluir información del total en la respuesta**
✅ **Usar skip() y limit() en lugar de offset**

## Troubleshooting

### Problema: Paginación no funciona
- ✓ Verificar que los parámetros sean números
- ✓ Implementar validación en middleware
- ✓ Revisar orden de middlewares en Express

### Problema: Rendimiento lento
- ✓ Crear índices en la BD
- ✓ Reducir el tamaño de la página
- ✓ Usar proyecciones (.select())

### Problema: Datos inconsistentes
- ✓ Usar límites de tiempo en caché
- ✓ Validar autorización en cada solicitud
- ✓ Implementar transacciones si es necesario
