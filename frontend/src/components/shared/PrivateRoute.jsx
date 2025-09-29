// src/components/shared/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Componente para proteger rotas que requerem autenticação
 * @param {Object} props
 * @param {React.Component} props.children - Componente filho a ser renderizado
 * @param {Array<string>} props.roles - Roles permitidas para acessar a rota
 * @param {string} props.redirectTo - Rota de redirecionamento se não autorizado
 */
const PrivateRoute = ({ 
  children, 
  roles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, loading, hasAnyRole, user } = useAuth();
  const location = useLocation();
  
  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }
  
  // Se roles foram especificadas, verificar permissões
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Acesso Negado
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              Sua role atual: <span className="font-medium">{user?.role || 'user'}</span>
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              Roles necessárias: <span className="font-medium">{roles.join(', ')}</span>
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Se passou em todas as verificações, renderizar o componente filho
  return children;
};

export default PrivateRoute;