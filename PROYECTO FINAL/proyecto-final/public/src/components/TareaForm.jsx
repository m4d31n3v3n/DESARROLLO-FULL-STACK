import React, { useState } from 'react';
import { tareasService } from '../services/api';

function TareaForm({ onCrear }) {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!titulo.trim()) {
            setError('El título es requerido');
            return;
        }

        setLoading(true);

        try {
            await tareasService.crear(titulo, descripcion);
            setTitulo('');
            setDescripcion('');
            onCrear();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tarea-form">
            <h2>Crear Nueva Tarea</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Título de la tarea"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Descripción (opcional)"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows="3"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Tarea'}
                </button>
            </form>
        </div>
    );
}

export default TareaForm;
