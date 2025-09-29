// src/components/auth/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  ShieldAlert, 
  ArrowLeft, 
  Home, 
  AlertTriangle,
  Lock,
  UserX,
  Clock
} from 'lucide-react';
import authService from '@/services/auth.service';

/**
 * Componente para proteger rotas com base em autenticação e permissões
 */
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  requireEmailVerification = false,
  fallbackPath = '/login',
  loadingComponent = null,
  unauthorizedComponent = null,
  showAlternativeActions = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  const location = useLocation();
  const { user, hasAnyRole, hasPermission, canAccess } = usePermissions();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Verificar se está autenticado
        const authenticated = authService.isAuthenticated();
        
        if (!authenticated) {
          // Tentar renovar o token
          const refreshed = await authService.refreshToken();
          if (!refreshed) {
            setIsAuthenticated(false);
            setAuthError('session_expired');
            return;
          }
        }

        // Verificar se o token é válido no servidor
        const tokenValid = await authService.verifyToken();
        if (!tokenValid) {
          setIsAuthenticated(false);
          setAuthError('invalid_token');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check error:', error);
        setIsAuthenticated(false);
        setAuthError('auth_error');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Componente de loading customizado ou padrão
  const LoadingComponent = loadingComponent || (() => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
      </div>
    </div>
  ));

  // Mostrar loading durante verificação
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || authError) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          from: location,
          error: authError,
          message: getAuthErrorMessage(authError)
        }} 
        replace 
      />
    );
  }

  // Verificar se o email precisa ser verificado
  if (requireEmailVerification && user && !user.emailVerified) {
    return (
      <EmailVerificationRequired 
        user={user}
        showAlternativeActions={showAlternativeActions}
      />
    );
  }

  // Verificar permissões de role
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    const UnauthorizedComponent = unauthorizedComponent || (() => (
      <UnauthorizedAccess 
        requiredRoles={requiredRoles}
        userRole={user?.role}
        reason="insufficient_role"
        showAlternativeActions={showAlternativeActions}
      />
    ));
    
    return <UnauthorizedComponent />;
  }

  // Verificar permissões específicas
  if (requiredPermissions.length > 0 && !requiredPermissions.some(permission => hasPermission(permission))) {
    const UnauthorizedComponent = unauthorizedComponent || (() => (
      <UnauthorizedAccess 
        requiredPermissions={requiredPermissions}
        userRole={user?.role}
        reason="insufficient_permissions"
        showAlternativeActions={showAlternativeActions}
      />
    ));
    
    return <UnauthorizedComponent />;
  }

  // Verificação geral usando a função canAccess
  if (!canAccess(requiredRoles, requiredPermissions)) {
    const UnauthorizedComponent = unauthorizedComponent || (() => (
      <UnauthorizedAccess 
        requiredRoles={requiredRoles}
        requiredPermissions={requiredPermissions}
        userRole={user?.role}
        reason="access_denied"
        showAlternativeActions={showAlternativeActions}
      />
    ));
    
    return <UnauthorizedComponent />;
  }

  // Se chegou até aqui, usuário tem acesso
  return children;
};

/**
 * Componente para quando o usuário não tem permissão
 */
const UnauthorizedAccess = ({ 
  requiredRoles = [], 
  requiredPermissions = [],
  userRole,
  reason = 'access_denied',
  showAlternativeActions = true
}) => {
  const getReasonConfig = (reason) => {
    const configs = {
      insufficient_role: {
        icon: UserX,
        title: 'Acesso Negado',
        description: 'Você não tem o perfil necessário para acessar esta página.',
        color: 'text-red-600'
      },
      insufficient_permissions: {
        icon: Lock,
        title: 'Permissão Insuficiente',
        description: 'Você não tem as permissões necessárias para acessar este recurso.',
        color: 'text-orange-600'
      },
      access_denied: {
        icon: ShieldAlert,
        title: 'Acesso Restrito',
        description: 'Esta área é restrita. Entre em contato com seu administrador se precisar de acesso.',
        color: 'text-red-600'
      }
    };
    
    return configs[reason] || configs.access_denied;
  };

  const config = getReasonConfig(reason);
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4`}>
              <IconComponent className={`h-8 w-8 ${config.color}`} />
            </div>
            <CardTitle className="text-xl">{config.title}</CardTitle>
            <CardDescription className="text-center">
              {config.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Informações sobre requisitos */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Detalhes do Acesso:</h4>
              
              {userRole && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Seu perfil: </span>
                  <span className="font-medium capitalize">{userRole}</span>
                </div>
              )}
              
              {requiredRoles.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Perfis necessários: </span>
                  <span className="font-medium">
                    {requiredRoles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
                  </span>
                </div>
              )}
              
              {requiredPermissions.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Permissões necessárias: </span>
                  <span className="font-medium">{requiredPermissions.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Ações alternativas */}
            {showAlternativeActions && (
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir para o Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Componente para quando é necessário verificar email
 */
const EmailVerificationRequired = ({ user, showAlternativeActions = true }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      setResendError(null);
      
      // Aqui você faria a chamada para reenviar o email de verificação
      // const result = await authService.resendEmailVerification();
      
      // Simulando sucesso por enquanto
      setTimeout(() => {
        setResendSuccess(true);
        setIsResending(false);
      }, 2000);
      
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendError('Erro ao reenviar email de verificação');
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Verificação de Email Necessária</CardTitle>
            <CardDescription className="text-center">
              Para acessar esta funcionalidade, você precisa verificar seu endereço de email.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                Verifique sua caixa de entrada e pasta de spam para encontrar o email de verificação.
              </p>
            </div>

            {resendSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>
                  Email de verificação reenviado com sucesso!
                </AlertDescription>
              </Alert>
            )}

            {resendError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {resendError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleResendVerification}
                disabled={isResending || resendSuccess}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : resendSuccess ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Email Enviado
                  </>
                ) : (
                  'Reenviar Email de Verificação'
                )}
              </Button>

              {showAlternativeActions && (
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Função para obter mensagem de erro de autenticação
 */
const getAuthErrorMessage = (error) => {
  const messages = {
    session_expired: 'Sua sessão expirou. Faça login novamente.',
    invalid_token: 'Token de acesso inválido. Faça login novamente.',
    auth_error: 'Erro de autenticação. Tente fazer login novamente.',
  };
  
  return messages[error] || 'É necessário fazer login para acessar esta página.';
};

export default ProtectedRoute;