import React, {useContext, useEffect, useState} from "react";
import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import { Users } from '../pages/Users';
import { Clientes } from "../pages/Clientes";
import { SingUp } from '../pages/SignUp';
import { useSelector } from 'react-redux';
import { TarjetaPrestamo } from "../pages/Clientes/TarjetaPrestamo";

export const RouterMain = () => {
    
    const {isLogin} = useSelector(state => state.authStore);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            {/* Rutas protegidas */}
            <Route path="/"                 element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard"        element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/users"            element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/clientes"         element={<PrivateRoute><Clientes /></PrivateRoute>} />
            <Route path="/clientes/:id"     element={<PrivateRoute><TarjetaPrestamo /></PrivateRoute>} />
            <Route path="/signUp"           element={<PrivateRoute><SingUp /></PrivateRoute>} />
            <Route path="/product/upload"   element={<PrivateRoute><SingUp /></PrivateRoute>} />
            {/* Ruta 404 opcional */}
            <Route path="*" element={<Navigate to={isLogin ? "/" : "/login"} />} />
        </Routes>
    )

}