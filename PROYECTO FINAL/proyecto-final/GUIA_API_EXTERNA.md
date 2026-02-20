# 🌍 Guía de Integración de API Externa: OpenWeather

## ¿Qué es una API Externa?

Una API externa es un servicio proporcionado por terceros que permite a tu aplicación acceder a datos o funcionalidades sin necesidad de implementarlas desde cero.

## Configuración de OpenWeather API

### 1. Obtener Clave API

1. Ir a [openweathermap.org](https://openweathermap.org/)
2. Registrarse y crear una cuenta
3. Ir a "API keys" en el dashboard
4. Copiar la clave en el archivo .env:

```env
OPENWEATHER_API_KEY=tu-clave-aqui
```

### 2. Estructura de Respuesta de OpenWeather

```json
{
  "coord": {"lon": -74.0060, "lat": 40.7128},
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "main": {
    "temp": 22.5,
    "feels_like": 21.0,
    "temp_min": 20.0,
    "temp_max": 25.0,
    "pressure": 1013,
    "humidity": 65
  },
  "wind": {"speed": 5.2, "deg": 180},
  "sys": {"country": "US"},
  "name": "New York"
}
```

## Implementación Backend

### 1. Instalar Axios

```bash
npm install axios
```

### 2. Crear Endpoint para Clima

```javascript
const axios = require('axios');

app.get('/api/clima/:ciudad', verificarToken, async (req, res, next) => {
    try {
        const { ciudad } = req.params;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        // Validar que tenemos la clave
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'API key de clima no configurada' 
            });
        }

        // Hacer solicitud a API externa
        const respuesta = await axios.get(
            'https://api.openweathermap.org/data/2.5/weather',
            {
                params: {
                    q: ciudad,              // Ciudad a buscar
                    appid: apiKey,          // Clave API
                    units: 'metric',        // Temperatura en Celsius
                    lang: 'es'              // Idioma español
                }
            }
        );

        // Extraer datos importantes
        res.json({
            ciudad: respuesta.data.name,
            pais: respuesta.data.sys.country,
            temperatura: respuesta.data.main.temp,
            sensacion: respuesta.data.main.feels_like,
            humedad: respuesta.data.main.humidity,
            descripcion: respuesta.data.weather[0].description,
            viento: respuesta.data.wind.speed
        });
    } catch (err) {
        // Manejo de errores específicos
        if (err.response?.status === 404) {
            res.status(404).json({ error: 'Ciudad no encontrada' });
        } else {
            next(err);
        }
    }
});
```

## Implementación Frontend (React)

### 1. Servicio de API

```javascript
// services/api.js
const API_URL = 'http://localhost:3000/api';

export const climaService = {
    async obtenerClima(ciudad) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/clima/${ciudad}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
};
```

### 2. Componente de Clima

```javascript
// components/Clima.jsx
import React, { useState } from 'react';
import { climaService } from '../services/api';

function Clima() {
    const [ciudad, setCiudad] = useState('');
    const [clima, setClima] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const buscarClima = async (e) => {
        e.preventDefault();
        if (!ciudad.trim()) return;

        setLoading(true);
        setError('');

        try {
            const datos = await climaService.obtenerClima(ciudad);
            setClima(datos);
        } catch (err) {
            setError(err.message || 'Error al obtener el clima');
            setClima(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="clima-widget">
            <h3>🌤️ Clima</h3>
            
            <form onSubmit={buscarClima}>
                <input
                    type="text"
                    placeholder="Ingresa una ciudad..."
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {error && <div className="error">{error}</div>}

            {clima && (
                <div className="clima-info">
                    <h4>{clima.ciudad}, {clima.pais}</h4>
                    <div className="temperatura">
                        {Math.round(clima.temperatura)}°C
                    </div>
                    <p>Sensación: {Math.round(clima.sensacion)}°C</p>
                    <p>Descripción: {clima.descripcion}</p>
                    <p>Humedad: {clima.humedad}%</p>
                    <p>Viento: {clima.viento} m/s</p>
                </div>
            )}
        </div>
    );
}

export default Clima;
```

## Manejo Avanzado de Errores

### 1. Errores Comunes

```javascript
// Error: Ciudad no encontrada
if (err.response?.status === 404) {
    return res.status(404).json({ 
        error: 'Ciudad no encontrada. Intenta de nuevo.' 
    });
}

// Error: Clave API inválida
if (err.response?.status === 401) {
    return res.status(500).json({ 
        error: 'Error de configuración de API' 
    });
}

// Error: Límite de solicitudes excedido
if (err.response?.status === 429) {
    return res.status(429).json({ 
        error: 'Demasiadas solicitudes. Intenta más tarde.' 
    });
}

// Error general de red
if (err.message === 'Network Error') {
    return res.status(503).json({ 
        error: 'No hay conexión con el servidor de clima' 
    });
}
```

### 2. Reintentos Automáticos

```javascript
const obtenerClimaConReintentos = async (ciudad, reintentos = 3) => {
    for (let i = 0; i < reintentos; i++) {
        try {
            return await climaService.obtenerClima(ciudad);
        } catch (err) {
            if (i === reintentos - 1) throw err;
            // Esperar 1 segundo antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};
```

## Caché de Datos

### Implementar caché local

```javascript
const cachéClima = {};

app.get('/api/clima/:ciudad', verificarToken, async (req, res, next) => {
    const { ciudad } = req.params;
    const ciudadNormalizada = ciudad.toLowerCase();

    // Verificar si está en caché (válido por 30 minutos)
    if (cachéClima[ciudadNormalizada]) {
        const duracion = Date.now() - cachéClima[ciudadNormalizada].timestamp;
        if (duracion < 30 * 60 * 1000) {
            return res.json(cachéClima[ciudadNormalizada].datos);
        }
    }

    try {
        const respuesta = await axios.get(
            'https://api.openweathermap.org/data/2.5/weather',
            { params: { q: ciudad, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' } }
        );

        const datos = {
            ciudad: respuesta.data.name,
            pais: respuesta.data.sys.country,
            temperatura: respuesta.data.main.temp,
            sensacion: respuesta.data.main.feels_like,
            humedad: respuesta.data.main.humidity,
            descripcion: respuesta.data.weather[0].description,
            viento: respuesta.data.wind.speed
        };

        // Guardar en caché
        cachéClima[ciudadNormalizada] = {
            datos,
            timestamp: Date.now()
        };

        res.json(datos);
    } catch (err) {
        next(err);
    }
});
```

## Ejemplos de Otras APIs

### 1. API de Conversión de Monedas
```javascript
// https://api.exchangerate-api.com/v4/latest/USD
const tasaCambio = await axios.get(
    'https://api.exchangerate-api.com/v4/latest/USD'
);
```

### 2. API de Redes Sociales (Twitter)
```javascript
// Requiere autenticación OAuth
const tweets = await axios.get(
    'https://api.twitter.com/2/tweets/search/recent',
    { headers: { 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}` } }
);
```

### 3. API de Pagos (Stripe)
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentIntent = await stripe.paymentIntents.create({
    amount: 2000,
    currency: 'usd'
});
```

## Seguridad en APIs Externas

✅ **Nunca expongas claves API en el cliente**
✅ **Usa variables de entorno**
✅ **Limita las solicitudes por usuario**
✅ **Implementa rate limiting**
✅ **Usa HTTPS siempre**
✅ **Valida e ingresa datos antes de usar**
✅ **Maneja errores gracefully**
✅ **Implementa caché cuando sea apropiado**

## Testing de API Externa

```javascript
// tests/clima.test.js
jest.mock('axios');
const axios = require('axios');

describe('API de Clima', () => {
    test('Debería obtener clima válido', async () => {
        axios.get.mockResolvedValue({
            data: {
                name: 'Madrid',
                main: { temp: 25, humidity: 60 },
                weather: [{ description: 'Soleado' }]
            }
        });

        // Prueba que el endpoint funciona
        const resultado = await climaService.obtenerClima('Madrid');
        expect(resultado.temperatura).toBe(25);
    });
});
```

## Troubleshooting

### Problema: 401 Unauthorized
- ✓ Verificar que la clave API es correcta
- ✓ Revisar que la suscripción está activa
- ✓ Comprobar que el token no ha expirado

### Problema: 429 Too Many Requests
- ✓ Implementar caché
- ✓ Aumentar el intervalo entre solicitudes
- ✓ Considerar un plan de pago más alto

### Problema: Timeout
- ✓ Aumentar el tiempo de espera
- ✓ Usar reintentos
- ✓ Implementar caché local
