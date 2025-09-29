// src/routes/index.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/Dashboard';

// Routes
import TransportadorasRoutes from './transportadoras.routes';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas (Auth) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Rotas protegidas (Dashboard) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Transportadoras */}
        <Route path="/transportadoras/*" element={<TransportadorasRoutes />} />
        
        {/* Outras rotas podem ser adicionadas aqui */}
        {/* <Route path="/romaneios/*" element={<RomaneiosRoutes />} /> */}
        {/* <Route path="/motoristas/*" element={<MotoristasRoutes />} /> */}
      </Route>

      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}