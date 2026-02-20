import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { adminService } from '../services/api';
import '../styles/Admin.css';

function Admin() {
    const [user, setUser, { logout }] = useContext(AuthContext);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.rol !== 'admin') {
            navigate('/dashboard');
            return;
        }
        cargarUsuarios();
    }, [user, navigate]);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const datos = await adminService.obtenerUsuarios();
            setUsuarios(datos);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarRol = async (usuarioId, nuevoRol) => {
        try {
            await adminService.cambiarRol(usuarioId, nuevoRol);
            cargarUsuarios();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDesactivar = async (usuarioId) => {
        try {
            await adminService.desactivarUsuario(usuarioId);
            cargarUsuarios();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-container">
            <nav className="navbar">
                <div className="navbar-brand">Panel Administrador</div>
                <div className="navbar-user">
                    <span>Administrador: {user?.nombre}</span>
                    <a href="/dashboard" className="back-link">Volver</a>
                    <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
                </div>
            </nav>

            <div className="admin-content">
                <h1>Gestión de Usuarios</h1>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">Cargando usuarios...</div>
                ) : (
                    <table className="usuarios-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(usuario => (
                                <tr key={usuario._id} className={!usuario.activo ? 'inactive' : ''}>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.email}</td>
                                    <td>
                                        <select
                                            value={usuario.rol}
                                            onChange={(e) => handleCambiarRol(usuario._id, e.target.value)}
                                            disabled={!usuario.activo}
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={usuario.activo ? 'badge-active' : 'badge-inactive'}>
                                            {usuario.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        {usuario.activo && (
                                            <button
                                                onClick={() => handleDesactivar(usuario._id)}
                                                className="btn-delete"
                                            >
                                                Desactivar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Admin;
