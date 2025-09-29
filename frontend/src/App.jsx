// src/App.jsx - VERSÃO CORRIGIDA COM ESTRUTURA DE ROTAS FIXADA

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { EnvironmentProvider } from '@/contexts/EnvironmentContext';
import PrivateRoute from '@/components/shared/PrivateRoute';
import MainLayout from '@/components/layout/MainLayout';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { AdminSettings } from '@/components/layout/AdminSettings';

// ==================== IMPORTAÇÕES DIRETAS (PÁGINAS PRINCIPAIS) ====================

// Auth
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';

// Dashboard
import Dashboard from '@/pages/dashboard/Dashboard';

// Transportadoras - CRUD COMPLETO
import TransportadorasList from '@/pages/transportadoras/TransportadorasList';
import TransportadoraCreate from '@/pages/transportadoras/TransportadoraCreate';
import TransportadoraEdit from '@/pages/transportadoras/TransportadoraEdit';
import TransportadoraDetails from '@/pages/transportadoras/TransportadoraDetails';

// Vínculos
import VinculosList from '@/pages/transportadoras/vinculos/VinculosList';
import VinculoCreate from '@/pages/transportadoras/vinculos/VinculoCreate';
import VinculoEdit from '@/pages/transportadoras/vinculos/VinculoEdit';

// Clientes
import ClientesList from '@/pages/clientes/ClientesList';
import ClienteCreate from '@/pages/clientes/ClienteCreate';
import ClienteEdit from '@/pages/clientes/ClienteEdit';

// Notas Fiscais
import NotasFiscaisList from '@/pages/notas-fiscais/NotasFiscaisList';
import NotasFiscaisDetail from '@/pages/notas-fiscais/NotasFiscaisDetail';

// Monitoramento
import MonitoringDashboard from '@/pages/monitoring/MonitoringDashboard';

// Legal
import TermsAndPrivacy from '@/pages/legal/TermsAndPrivacy';

// Messaging
import MessagingConfig from '@/components/messaging/MessagingConfig';

// ==================== CONFIGURAÇÃO DO REACT QUERY ====================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ==================== COMPONENTE DE LOADING ====================

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
    </div>
  </div>
);

// ==================== COMPONENTE PRINCIPAL ====================

function App() {
  return (
    <ErrorBoundary>
      <EnvironmentProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <AuthProvider>
              <EmailProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* ==================== ROTAS PÚBLICAS ==================== */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/terms" element={<TermsAndPrivacy />} />

                    {/* ==================== ROTAS PRIVADAS ==================== */}
                    <Route
                      path="/"
                      element={
                        <PrivateRoute>
                          <MainLayout />
                        </PrivateRoute>
                      }
                    >
                      {/* Redirect raiz para dashboard */}
                      <Route index element={<Navigate to="/dashboard" replace />} />

                      {/* ========== DASHBOARD ========== */}
                      <Route path="dashboard" element={<Dashboard />} />

                      {/* ========== TRANSPORTADORAS (CRUD COMPLETO) ========== */}
                      <Route path="transportadoras">
                        {/* Lista de transportadoras */}
                        <Route
                          index
                          element={
                            <PrivateRoute roles={['admin', 'gestor']}>
                              <TransportadorasList />
                            </PrivateRoute>
                          }
                        />

                        {/* Criar nova transportadora */}
                        <Route
                          path="novo"
                          element={
                            <PrivateRoute roles={['admin', 'gestor']}>
                              <TransportadoraCreate />
                            </PrivateRoute>
                          }
                        />

                        {/* Rotas específicas para cada transportadora */}
                        <Route path=":id">
                          {/* Detalhes da transportadora */}
                          <Route
                            index
                            element={
                              <PrivateRoute roles={['admin', 'gestor']}>
                                <TransportadoraDetails />
                              </PrivateRoute>
                            }
                          />

                          {/* Editar transportadora */}
                          <Route
                            path="editar"
                            element={
                              <PrivateRoute roles={['admin', 'gestor']}>
                                <TransportadoraEdit />
                              </PrivateRoute>
                            }
                          />

                          {/* Vínculos - Subrotas aninhadas */}
                          <Route path="vinculos">
                            {/* Lista de vínculos */}
                            <Route
                              index
                              element={
                                <PrivateRoute roles={['admin', 'gestor']}>
                                  <VinculosList />
                                </PrivateRoute>
                              }
                            />
                            
                            {/* Criar novo vínculo */}
                            <Route
                              path="novo"
                              element={
                                <PrivateRoute roles={['admin', 'gestor']}>
                                  <VinculoCreate />
                                </PrivateRoute>
                              }
                            />
                            
                            {/* Editar vínculo existente */}
                            <Route
                              path=":vinculoId/editar"
                              element={
                                <PrivateRoute roles={['admin', 'gestor']}>
                                  <VinculoEdit />
                                </PrivateRoute>
                              }
                            />
                          </Route>
                        </Route>
                      </Route>

                      {/* ========== CLIENTES ========== */}
                      <Route path="clientes">
                        <Route
                          index
                          element={
                            <PrivateRoute roles={['admin', 'gestor', 'operador']}>
                              <ClientesList />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="novo"
                          element={
                            <PrivateRoute roles={['admin', 'gestor']}>
                              <ClienteCreate />
                            </PrivateRoute>
                          }
                        />
                        <Route path=":id">
                          <Route
                            path="editar"
                            element={
                              <PrivateRoute roles={['admin', 'gestor']}>
                                <ClienteEdit />
                              </PrivateRoute>
                            }
                          />
                        </Route>
                      </Route>

                      {/* ========== NOTAS FISCAIS ========== */}
                      <Route path="notas-fiscais">
                        <Route index element={<NotasFiscaisList />} />
                        <Route path=":id" element={<NotasFiscaisDetail />} />
                      </Route>

                      {/* ========== MONITORAMENTO ========== */}
                      <Route
                        path="monitoring"
                        element={
                          <PrivateRoute roles={['admin', 'gestor']}>
                            <MonitoringDashboard />
                          </PrivateRoute>
                        }
                      />

                      {/* ========== ADMIN ========== */}
                      <Route path="admin">
                        <Route
                          index
                          element={
                            <PrivateRoute roles={['admin']}>
                              <Navigate to="/admin/dashboard" replace />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="dashboard"
                          element={
                            <PrivateRoute roles={['admin']}>
                              <Dashboard />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="settings"
                          element={
                            <PrivateRoute roles={['admin']}>
                              <AdminSettings />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="messaging"
                          element={
                            <PrivateRoute roles={['admin']}>
                              <MessagingConfig />
                            </PrivateRoute>
                          }
                        />
                      </Route>
                    </Route>

                    {/* ==================== ROTA 404 ==================== */}
                    <Route
                      path="*"
                      element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                          <div className="text-center max-w-md p-6">
                            <div className="mb-8">
                              <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
                                404
                              </h1>
                              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Página não encontrada
                              </h2>
                              <p className="text-gray-600 dark:text-gray-400">
                                A página que você está procurando não existe ou foi movida.
                              </p>
                            </div>
                            <a
                              href="/dashboard"
                              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              Voltar ao Dashboard
                            </a>
                          </div>
                        </div>
                      }
                    />
                  </Routes>
                </Suspense>

                {/* ==================== COMPONENTES GLOBAIS ==================== */}
                <Toaster />
                {import.meta.env.DEV && (
                  <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                )}
              </EmailProvider>
            </AuthProvider>
          </Router>
        </QueryClientProvider>
      </EnvironmentProvider>
    </ErrorBoundary>
  );
}

export default App;