import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { tareasService, climaService } from '../services/api';
import TareaList from '../components/TareaList';
import TareaForm from '../components/TareaForm';
import Clima from '../components/Clima';
import '../styles/Dashboard.css';

function Dashboard() {
    const [user, setUser, { logout }] = useContext(AuthContext);
    const [tareas, setTareas] = useState([]);
    const [paginacion, setPaginacion] = useState({ pagina: 1, limite: 10 });
    const [filtros, setFiltros] = useState({ completada: undefined, busqueda: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        cargarTareas();
    }, [paginacion, filtros]);

    const cargarTareas = async () => {
        setLoading(true);
        try {
            const datos = await tareasService.obtener(
                paginacion.pagina,
                paginacion.limite,
                { ...filtros, completada: filtros.completada === undefined ? '' : filtros.completada }
            );
            setTareas(datos.tareas);
            setPaginacion(datos.paginacion);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCrearTarea = () => {
        cargarTareas();
    };

    const handleEliminarTarea = async (id) => {
        try {
            await tareasService.eliminar(id);
            cargarTareas();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleToggleCompletada = async (id, completada) => {
        try {
            await tareasService.actualizar(id, { completada: !completada });
            cargarTareas();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="navbar-brand">Gestor de Tareas</div>
                <div className="navbar-user">
                    <span>Bienvenido, {user?.nombre}</span>
                    {user?.rol === 'admin' && (
                        <a href="/admin" className="admin-link">Panel Admin</a>
                    )}
                    <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="main-section">
                    <TareaForm onCrear={handleCrearTarea} />

                    <div className="filtros">
                        <input
                            type="text"
                            placeholder="Buscar tarea..."
                            value={filtros.busqueda}
                            onChange={(e) => {
                                setFiltros({ ...filtros, busqueda: e.target.value });
                                setPaginacion({ ...paginacion, pagina: 1 });
                            }}
                        />
                        <select
                            value={filtros.completada === undefined ? '' : filtros.completada}
                            onChange={(e) => {
                                const valor = e.target.value === '' ? undefined : e.target.value === 'true';
                                setFiltros({ ...filtros, completada: valor });
                                setPaginacion({ ...paginacion, pagina: 1 });
                            }}
                        >
                            <option value="">Todas</option>
                            <option value="false">Pendientes</option>
                            <option value="true">Completadas</option>
                        </select>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <div className="loading">Cargando...</div>
                    ) : (
                        <>
                            <TareaList
                                tareas={tareas}
                                onEliminar={handleEliminarTarea}
                                onToggle={handleToggleCompletada}
                            />

                            <div className="paginacion">
                                <button
                                    onClick={() => setPaginacion({ ...paginacion, pagina: Math.max(1, paginacion.pagina - 1) })}
                                    disabled={paginacion.pagina === 1}
                                >
                                    Anterior
                                </button>
                                <span>Página {paginacion.pagina} de {paginacion.páginas}</span>
                                <button
                                    onClick={() => setPaginacion({ ...paginacion, pagina: Math.min(paginacion.páginas, paginacion.pagina + 1) })}
                                    disabled={paginacion.pagina === paginacion.páginas}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <aside className="sidebar">
                    <Clima />
                </aside>
            </div>
        </div>
    );
}

export default Dashboard;
