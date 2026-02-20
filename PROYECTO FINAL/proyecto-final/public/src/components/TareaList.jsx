import React from 'react';

function TareaList({ tareas, onEliminar, onToggle }) {
    if (tareas.length === 0) {
        return <div className="no-tareas">No hay tareas</div>;
    }

    return (
        <div className="tareas-list">
            {tareas.map(tarea => (
                <div key={tarea._id} className={`tarea-item ${tarea.completada ? 'completada' : ''}`}>
                    <div className="tarea-content">
                        <input
                            type="checkbox"
                            checked={tarea.completada}
                            onChange={() => onToggle(tarea._id, tarea.completada)}
                            className="tarea-checkbox"
                        />
                        <div className="tarea-info">
                            <h3>{tarea.titulo}</h3>
                            {tarea.descripcion && <p>{tarea.descripcion}</p>}
                            <small>{new Date(tarea.createdAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                    <button
                        onClick={() => onEliminar(tarea._id)}
                        className="btn-delete"
                    >
                        Eliminar
                    </button>
                </div>
            ))}
        </div>
    );
}

export default TareaList;
