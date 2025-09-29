// src/components/PrivateRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Componente para proteger rotas privadas
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente filho a ser renderizado
 * @param {string[]} props.roles - Roles permitidas para acessar a rota
 */
export default function PrivateRoute({ children, roles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permissões de role
  if (roles.length > 0 && user?.role) {
    const hasPermission = roles.includes(user.role);
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md p-6">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-red-600 dark:text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Você não tem permissão para acessar esta página. 
              Entre em contato com o administrador se acredita que isso é um erro.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-500">
                <strong>Seu perfil:</strong> {user.role || 'Não definido'}
              </p>
              <p className="text-gray-500">
                <strong>Perfis necessários:</strong> {roles.join(', ')}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }
  }

  // Renderizar componente protegido
  return children;
}