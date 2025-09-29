// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import authService from '@/services/auth.service';

// Estados do contexto
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  lastActivity: null,
  sessionExpiry: null
};

// Ações do reducer
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY',
  SET_SESSION_EXPIRY: 'SET_SESSION_EXPIRY'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastActivity: new Date().toISOString(),
        sessionExpiry: action.payload.sessionExpiry
      };
    
    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivity: null,
        sessionExpiry: null
      };
    
    case AuthActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
    
    case AuthActionTypes.UPDATE_LAST_ACTIVITY:
      return {
        ...state,
        lastActivity: new Date().toISOString()
      };
    
    case AuthActionTypes.SET_SESSION_EXPIRY:
      return {
        ...state,
        sessionExpiry: action.payload
      };
    
    default:
      return state;
  }
};

// Criar contexto
const AuthContext = createContext(null);

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Função para atualizar atividade
  const updateActivity = useCallback(() => {
    if (state.isAuthenticated) {
      dispatch({ type: AuthActionTypes.UPDATE_LAST_ACTIVITY });
    }
  }, [state.isAuthenticated]);

  // Verificar autenticação inicial
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
        
        const isAuth = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();
        
        if (isAuth && currentUser) {
          // Verificar se o token ainda é válido
          const isValid = await authService.verifyToken();
          
          if (isValid) {
            const tokenExpiration = localStorage.getItem('tokenExpiration');
            dispatch({
              type: AuthActionTypes.LOGIN_SUCCESS,
              payload: {
                user: currentUser,
                sessionExpiry: tokenExpiration ? new Date(parseInt(tokenExpiration)) : null
              }
            });
          } else {
            // Token inválido, tentar refresh
            const refreshed = await authService.refreshToken();
            if (refreshed) {
              const updatedUser = authService.getCurrentUser();
              const tokenExpiration = localStorage.getItem('tokenExpiration');
              dispatch({
                type: AuthActionTypes.LOGIN_SUCCESS,
                payload: {
                  user: updatedUser,
                  sessionExpiry: tokenExpiration ? new Date(parseInt(tokenExpiration)) : null
                }
              });
            } else {
              dispatch({ type: AuthActionTypes.LOGOUT });
            }
          }
        } else {
          dispatch({ type: AuthActionTypes.LOGOUT });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch({ type: AuthActionTypes.LOGOUT });
      } finally {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Monitorar atividade do usuário
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      updateActivity();
    };

    // Adicionar listeners
    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
    };
  }, [state.isAuthenticated, updateActivity]);

  // Verificar expiração da sessão
  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionExpiry) return;

    const checkExpiry = () => {
      const now = new Date().getTime();
      const expiry = new Date(state.sessionExpiry).getTime();
      
      // Se vai expirar em 5 minutos, tentar renovar
      if (now >= (expiry - 5 * 60 * 1000) && now < expiry) {
        authService.refreshToken().then(refreshed => {
          if (refreshed) {
            const tokenExpiration = localStorage.getItem('tokenExpiration');
            dispatch({
              type: AuthActionTypes.SET_SESSION_EXPIRY,
              payload: tokenExpiration ? new Date(parseInt(tokenExpiration)) : null
            });
          }
        });
      }
      
      // Se já expirou, fazer logout
      if (now >= expiry) {
        handleLogout();
      }
    };

    const interval = setInterval(checkExpiry, 60000); // Verificar a cada minuto
    
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.sessionExpiry]);

  // Função de login
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      dispatch({ type: AuthActionTypes.CLEAR_ERROR });
      
      const result = await authService.login(credentials);
      
      if (result.success) {
        const tokenExpiration = localStorage.getItem('tokenExpiration');
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: result.user,
            sessionExpiry: tokenExpiration ? new Date(parseInt(tokenExpiration)) : null
          }
        });
        
        toast({
          title: 'Login realizado',
          description: `Bem-vindo, ${result.user.nome}!`,
        });
        
        // Redirecionar baseado na role
        const redirectPath = getRedirectPath(result.user.role);
        navigate(redirectPath);
        
        return { success: true };
      } else {
        dispatch({ type: AuthActionTypes.SET_ERROR, payload: result.message });
        toast({
          title: 'Erro no login',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Erro ao conectar com o servidor';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: errorMessage });
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  }, [navigate, toast]);

  // Função de registro
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      dispatch({ type: AuthActionTypes.CLEAR_ERROR });
      
      const result = await authService.register(userData);
      
      if (result.success) {
        const tokenExpiration = localStorage.getItem('tokenExpiration');
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: result.user,
            sessionExpiry: tokenExpiration ? new Date(parseInt(tokenExpiration)) : null
          }
        });
        
        toast({
          title: 'Conta criada!',
          description: 'Sua conta foi criada com sucesso',
        });
        
        navigate('/dashboard');
        return { success: true };
      } else {
        dispatch({ type: AuthActionTypes.SET_ERROR, payload: result.message });
        toast({
          title: 'Erro no registro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = 'Erro ao conectar com o servidor';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: errorMessage });
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  }, [navigate, toast]);

  // Função de logout
  const handleLogout = useCallback(async () => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      await authService.logout();
      dispatch({ type: AuthActionTypes.LOGOUT });
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso',
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Mesmo com erro, limpar dados locais
      authService.clearLocalData();
      dispatch({ type: AuthActionTypes.LOGOUT });
      navigate('/login');
    } finally {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  }, [navigate, toast]);

  // Atualizar perfil
  const updateProfile = useCallback(async () => {
    try {
      const result = await authService.getProfile();
      
      if (result.success) {
        dispatch({ type: AuthActionTypes.UPDATE_USER, payload: result.user });
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Erro ao atualizar perfil' };
    }
  }, []);

  // Alterar senha
  const changePassword = useCallback(async (passwordData) => {
    try {
      const result = await authService.changePassword(passwordData);
      
      if (result.success) {
        toast({
          title: 'Senha alterada',
          description: 'Sua senha foi alterada com sucesso',
        });
        return { success: true };
      } else {
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar senha',
        variant: 'destructive',
      });
      return { success: false, message: 'Erro ao alterar senha' };
    }
  }, [toast]);

  // Verificações de permissão
  const hasRole = useCallback((role) => {
    return authService.hasRole(role);
  }, []);

  const hasAnyRole = useCallback((roles) => {
    return authService.hasAnyRole(roles);
  }, []);

  const hasPermission = useCallback((permission) => {
    return authService.hasPermission(permission);
  }, []);

  const canAccess = useCallback((requiredRoles = [], requiredPermissions = []) => {
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return false;
    }
    
    if (requiredPermissions.length > 0) {
      return requiredPermissions.some(permission => hasPermission(permission));
    }
    
    return true;
  }, [hasAnyRole, hasPermission]);

  // Função para obter caminho de redirecionamento baseado na role
  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'gestor':
        return '/dashboard';
      case 'operador':
        return '/operacional';
      default:
        return '/dashboard';
    }
  };

  // Limpar erro
  const clearError = useCallback(() => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  }, []);

  // Verificar se a sessão está próxima do vencimento
  const isSessionExpiringSoon = useCallback(() => {
    if (!state.sessionExpiry) return false;
    
    const now = new Date().getTime();
    const expiry = new Date(state.sessionExpiry).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return now >= (expiry - fiveMinutes) && now < expiry;
  }, [state.sessionExpiry]);

  // Obter tempo restante da sessão
  const getSessionTimeRemaining = useCallback(() => {
    if (!state.sessionExpiry) return 0;
    
    const now = new Date().getTime();
    const expiry = new Date(state.sessionExpiry).getTime();
    
    return Math.max(0, expiry - now);
  }, [state.sessionExpiry]);

  // Valores do contexto
  const value = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    lastActivity: state.lastActivity,
    sessionExpiry: state.sessionExpiry,
    
    // Ações
    login,
    register,
    logout: handleLogout,
    updateProfile,
    changePassword,
    clearError,
    
    // Verificações de permissão
    hasRole,
    hasAnyRole,
    hasPermission,
    canAccess,
    
    // Utilidades de sessão
    isSessionExpiringSoon,
    getSessionTimeRemaining,
    
    // Helpers
    isAdmin: hasRole('admin'),
    isGestor: hasRole('gestor'),
    isOperador: hasRole('operador')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};