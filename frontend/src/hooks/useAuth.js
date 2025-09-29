// src/hooks/useAuth.js
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import authService from '@/services/auth.service';

/**
 * Hook para operações de autenticação
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.login(credentials);
      
      if (result.success) {
        toast({
          title: 'Login realizado',
          description: 'Bem-vindo de volta!',
        });
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        toast({
          title: 'Erro no login',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao conectar com o servidor';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Registro
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.register(userData);
      
      if (result.success) {
        toast({
          title: 'Conta criada',
          description: 'Sua conta foi criada com sucesso!',
        });
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        toast({
          title: 'Erro no registro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao conectar com o servidor';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
      
      navigate('/login');
      return { success: true };
    } catch (err) {
      // Mesmo com erro, fazer logout local
      authService.clearLocalData();
      navigate('/login');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // Esqueceu senha
  const forgotPassword = useCallback(async (email) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.forgotPassword(email);
      
      if (result.success) {
        toast({
          title: 'Email enviado',
          description: 'Verifique sua caixa de entrada',
        });
        return { success: true };
      } else {
        setError(result.message);
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao enviar email de recuperação';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Redefinir senha
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.resetPassword(token, newPassword);
      
      if (result.success) {
        toast({
          title: 'Senha redefinida',
          description: 'Sua senha foi alterada com sucesso',
        });
        return { success: true };
      } else {
        setError(result.message);
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao redefinir senha';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Alterar senha
  const changePassword = useCallback(async (passwordData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.changePassword(passwordData);
      
      if (result.success) {
        toast({
          title: 'Senha alterada',
          description: 'Sua senha foi alterada com sucesso',
        });
        return { success: true };
      } else {
        setError(result.message);
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao alterar senha';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    clearError: () => setError(null)
  };
};

/**
 * Hook para verificar permissões
 */
export const usePermissions = () => {
  const user = authService.getCurrentUser();
  
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
  
  return {
    user,
    hasRole,
    hasAnyRole,
    hasPermission,
    canAccess,
    isAdmin: hasRole('admin'),
    isGestor: hasRole('gestor'),
    isOperador: hasRole('operador')
  };
};

/**
 * Hook para gerenciar perfil do usuário
 */
export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Obter perfil
  const getProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.getProfile();
      
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao obter perfil';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Atualizar perfil
  const updateProfile = useCallback(async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram salvas',
        });
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao atualizar perfil';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  return {
    isLoading,
    error,
    getProfile,
    updateProfile,
    clearError: () => setError(null)
  };
};

/**
 * Hook para gerenciar sessões ativas
 */
export const useSessions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Listar sessões ativas
  const getSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.getActiveSessions();
      
      if (result.success) {
        setSessions(result.sessions);
        return { success: true, sessions: result.sessions };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao obter sessões';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Revogar sessão
  const revokeSession = useCallback(async (sessionId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.revokeSession(sessionId);
      
      if (result.success) {
        toast({
          title: 'Sessão revogada',
          description: 'A sessão foi encerrada com sucesso',
        });
        
        // Atualizar lista de sessões
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        
        return { success: true };
      } else {
        setError(result.message);
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao revogar sessão';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Revogar todas as outras sessões
  const revokeAllOtherSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.revokeAllOtherSessions();
      
      if (result.success) {
        toast({
          title: 'Sessões revogadas',
          description: 'Todas as outras sessões foram encerradas',
        });
        
        // Recarregar sessões
        await getSessions();
        
        return { success: true };
      } else {
        setError(result.message);
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao revogar sessões';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast, getSessions]);
  
  return {
    isLoading,
    sessions,
    error,
    getSessions,
    revokeSession,
    revokeAllOtherSessions,
    clearError: () => setError(null)
  };
};