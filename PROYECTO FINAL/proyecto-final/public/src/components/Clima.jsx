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
            setError(err.message);
            setClima(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="clima-widget">
            <h3>Clima</h3>
            <form onSubmit={buscarClima}>
                <input
                    type="text"
                    placeholder="Buscar ciudad..."
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {clima && (
                <div className="clima-info">
                    <h4>{clima.ciudad}, {clima.pais}</h4>
                    <div className="clima-temp">
                        <p className="temperatura">{Math.round(clima.temperatura)}°C</p>
                        <p className="sensacion">Sensación: {Math.round(clima.sensacion)}°C</p>
                    </div>
                    <div className="clima-detalles">
                        <p><strong>Descripción:</strong> {clima.descripcion}</p>
                        <p><strong>Humedad:</strong> {clima.humedad}%</p>
                        <p><strong>Viento:</strong> {clima.viento} m/s</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Clima;
