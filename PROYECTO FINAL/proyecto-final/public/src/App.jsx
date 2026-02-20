import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { AuthContext, AuthProvider } from './context/AuthContext';

function App() {
    const [user, setUser] = useContext(AuthContext);

    return (
        <Router>
            <Routes>
                {!user ? (
                    <>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </>
                ) : (
                    <>
                        <Route path="/dashboard" element={<Dashboard />} />
                        {user.rol === 'admin' && <Route path="/admin" element={<Admin />} />}
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </>
                )}
            </Routes>
        </Router>
    );
}

export default App;
