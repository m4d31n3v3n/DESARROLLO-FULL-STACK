const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

const headers = (token = getToken()) => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
});

// ============ AUTENTICACIÓN ============

export const authService = {
    async register(email, password, nombre) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ email, password, nombre })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async login(email, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async getPerfil() {
        const response = await fetch(`${API_URL}/auth/perfil`, {
            headers: headers()
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
};

// ============ TAREAS ============

export const tareasService = {
    async obtener(pagina = 1, limite = 10, filtros = {}) {
        const params = new URLSearchParams({
            pagina,
            limite,
            ...filtros
        });

        const response = await fetch(`${API_URL}/tareas?${params}`, {
            headers: headers()
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async obtenerUna(id) {
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            headers: headers()
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async crear(titulo, descripcion) {
        const response = await fetch(`${API_URL}/tareas`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ titulo, descripcion })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async actualizar(id, { titulo, descripcion, completada }) {
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify({ titulo, descripcion, completada })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async eliminar(id) {
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'DELETE',
            headers: headers()
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
};

// ============ CLIMA ============

export const climaService = {
    async obtenerClima(ciudad) {
        const response = await fetch(`${API_URL}/clima/${ciudad}`, {
            headers: headers()
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
};

// ============ ADMINISTRADOR ============

export const adminService = {
    async obtenerUsuarios() {
        const response = await fetch(`${API_URL}/admin/usuarios`, {
            headers: headers()
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async cambiarRol(usuarioId, rol) {
        const response = await fetch(`${API_URL}/admin/usuarios/${usuarioId}/rol`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify({ rol })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    },

    async desactivarUsuario(usuarioId) {
        const response = await fetch(`${API_URL}/admin/usuarios/${usuarioId}`, {
            method: 'DELETE',
            headers: headers()
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
};
