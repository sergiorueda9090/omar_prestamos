import React from "react";
import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import { Users } from '../pages/Users';
import ClientesTestMejorado from "../pages/Clientestestmejorado";
import { useSelector } from 'react-redux';

export const RouterMain = () => {

    const {isLogin} = useSelector(state => state.authStore);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            {/* Rutas protegidas */}
            <Route path="/"                 element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard"        element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/users"            element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/clientes"           element={<PrivateRoute><ClientesTestMejorado /></PrivateRoute>} />
            <Route path="/clientes/vigentes" element={<PrivateRoute><ClientesTestMejorado /></PrivateRoute>} />
            <Route path="/clientes/perdidos" element={<PrivateRoute><ClientesTestMejorado /></PrivateRoute>} />
            <Route path="/clientes/pagos"    element={<PrivateRoute><ClientesTestMejorado /></PrivateRoute>} />
            <Route path="/clientes/:id"      element={<PrivateRoute><ClientesTestMejorado /></PrivateRoute>} />
            {/* Ruta 404 opcional */}
            <Route path="*" element={<Navigate to={isLogin ? "/" : "/login"} />} />
        </Routes>
    )

}