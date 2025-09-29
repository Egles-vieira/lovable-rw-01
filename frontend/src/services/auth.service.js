// src/services/auth.service.js
import api, { setAuthToken } from './api';

class AuthService {
  /**
   * Login do usuário
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.success && response.data) {
        const { token, user, expiresIn, refreshToken } = response.data;
        
        // Salvar token e dados do usuário
        setAuthToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expiresIn', expiresIn);
        
        // Salvar refresh token se disponível
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Calcular e salvar momento de expiração
        if (expiresIn) {
          const expirationTime = new Date().getTime() + this.parseExpiresIn(expiresIn);
          localStorage.setItem('tokenExpiration', expirationTime.toString());
        }
        
        return {
          success: true,
          user,
          token,
        };
      }
      
      return {
        success: false,
        message: response.message || 'Erro ao fazer login',
      };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Email ou senha incorretos',
        };
      } else if (error.response?.status === 423) {
        return {
          success: false,
          message: 'Conta bloqueada. Entre em contato com o suporte.',
        };
      } else if (error.response?.status === 429) {
        return {
          success: false,
          message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao conectar com o servidor',
      };
    }
  }
  
  /**
   * Registro de novo usuário
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.success && response.data) {
        const { token, user, expiresIn, refreshToken } = response.data;
        
        // Salvar token e dados do usuário
        setAuthToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expiresIn', expiresIn);
        
        // Salvar refresh token se disponível
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Calcular e salvar momento de expiração
        if (expiresIn) {
          const expirationTime = new Date().getTime() + this.parseExpiresIn(expiresIn);
          localStorage.setItem('tokenExpiration', expirationTime.toString());
        }
        
        return {
          success: true,
          user,
          token,
        };
      }
      
      return {
        success: false,
        message: response.message || 'Erro ao criar conta',
        errors: response.errors || []
      };
    } catch (error) {
      console.error('Register error:', error);
      
      // Tratar erro de resposta HTTP
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 422) {
          return {
            success: false,
            message: data.message || 'Dados inválidos. Verifique as informações fornecidas.',
            errors: data.errors || []
          };
        } else if (status === 409) {
          return {
            success: false,
            message: 'Este email já está em uso',
            errors: []
          };
        } else if (status === 400) {
          return {
            success: false,
            message: data.message || 'Dados inválidos no corpo da requisição',
            errors: data.errors || []
          };
        }
        
        return {
          success: false,
          message: data.message || 'Erro no servidor',
          errors: data.errors || []
        };
      }
      
      // Erro de rede ou outros
      return {
        success: false,
        message: error.message || 'Erro ao conectar com o servidor',
        errors: []
      };
    }
  }
  
  /**
   * Logout do usuário
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpar dados locais independente do resultado
      this.clearLocalData();
    }
  }
  
  /**
   * Verificar se o token é válido
   */
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.success === true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }
  
  /**
   * Renovar token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;
      
      const response = await api.post('/auth/refresh', { 
        refreshToken: refreshToken 
      });
      
      if (response.success && response.data) {
        const { token, user, expiresIn, refreshToken: newRefreshToken } = response.data;
        
        // Atualizar token e dados
        setAuthToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expiresIn', expiresIn);
        
        // Atualizar refresh token se fornecido
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Calcular nova expiração
        if (expiresIn) {
          const expirationTime = new Date().getTime() + this.parseExpiresIn(expiresIn);
          localStorage.setItem('tokenExpiration', expirationTime.toString());
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearLocalData();
      return false;
    }
  }
  
  /**
   * Solicitar recuperação de senha
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      return {
        success: response.success || false,
        message: response.message || 'Email de recuperação enviado'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Email não encontrado em nosso sistema'
        };
      } else if (error.response?.status === 429) {
        return {
          success: false,
          message: 'Muitas tentativas. Tente novamente em alguns minutos'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao solicitar recuperação'
      };
    }
  }
  
  /**
   * Redefinir senha
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      
      return {
        success: response.success || false,
        message: response.message || 'Senha redefinida com sucesso'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Token inválido ou expirado'
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Token não encontrado'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao redefinir senha'
      };
    }
  }
  
  /**
   * Alterar senha
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      
      return {
        success: response.success || false,
        message: response.message || 'Senha alterada com sucesso'
      };
    } catch (error) {
      console.error('Change password error:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Senha atual incorreta'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao alterar senha'
      };
    }
  }
  
  /**
   * Obter perfil do usuário atual
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.success && response.data) {
        // Atualizar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user
        };
      }
      
      return {
        success: false,
        message: response.message || 'Erro ao obter perfil'
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter perfil'
      };
    }
  }
  
  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.success && response.data) {
        // Atualizar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          message: response.message || 'Perfil atualizado com sucesso'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Erro ao atualizar perfil'
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar perfil'
      };
    }
  }
  
  /**
   * Verificar se o usuário tem uma determinada role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.role === role;
  }
  
  /**
   * Verificar se o usuário tem qualquer uma das roles especificadas
   */
  hasAnyRole(roles) {
    if (!Array.isArray(roles) || roles.length === 0) return true;
    
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return roles.includes(user.role);
  }
  
  /**
   * Verificar se o usuário tem permissão específica
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Se o usuário é admin, tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Verificar permissões específicas do usuário
    return user.permissions?.includes(permission) || false;
  }
  
  /**
   * Obter usuário atual do localStorage
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  
  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    
    if (!token || !user) return false;
    
    // Verificar se o token não expirou
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    if (tokenExpiration) {
      const now = new Date().getTime();
      if (now >= parseInt(tokenExpiration)) {
        // Token expirado, tentar renovar
        this.refreshToken();
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Limpar dados locais de autenticação
   */
  clearLocalData() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('tokenExpiration');
    setAuthToken(null);
  }
  
  /**
   * Converter string de expiração para millisegundos
   */
  parseExpiresIn(expiresIn) {
    if (typeof expiresIn === 'number') {
      return expiresIn * 1000; // assumindo segundos
    }
    
    if (typeof expiresIn === 'string') {
      // Exemplos: "7d", "1h", "30m", "3600s"
      const matches = expiresIn.match(/^(\d+)([smhd])$/);
      if (!matches) return 24 * 60 * 60 * 1000; // default 24h
      
      const value = parseInt(matches[1]);
      const unit = matches[2];
      
      switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return 24 * 60 * 60 * 1000;
      }
    }
    
    return 24 * 60 * 60 * 1000; // default 24h
  }
  
  /**
   * Inicializar serviço de autenticação
   */
  initialize() {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      
      // Verificar se precisa renovar o token
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      if (tokenExpiration) {
        const now = new Date().getTime();
        const expirationTime = parseInt(tokenExpiration);
        
        // Se vai expirar em menos de 5 minutos, renovar
        if (now >= (expirationTime - 5 * 60 * 1000)) {
          this.refreshToken();
        }
      }
    }
  }
  
  /**
   * Configurar renovação automática do token
   */
  setupAutoRefresh() {
    // Renovar token a cada 50 minutos (assumindo token de 1 hora)
    setInterval(() => {
      if (this.isAuthenticated()) {
        this.refreshToken();
      }
    }, 50 * 60 * 1000);
  }
  
  /**
   * Listar sessões ativas (se suportado pelo backend)
   */
  async getActiveSessions() {
    try {
      const response = await api.get('/auth/sessions');
      
      return {
        success: response.success || false,
        sessions: response.data?.sessions || []
      };
    } catch (error) {
      console.error('Get active sessions error:', error);
      return {
        success: false,
        message: 'Erro ao obter sessões ativas'
      };
    }
  }
  
  /**
   * Revogar sessão específica
   */
  async revokeSession(sessionId) {
    try {
      const response = await api.delete(`/auth/sessions/${sessionId}`);
      
      return {
        success: response.success || false,
        message: response.message || 'Sessão revogada com sucesso'
      };
    } catch (error) {
      console.error('Revoke session error:', error);
      return {
        success: false,
        message: 'Erro ao revogar sessão'
      };
    }
  }
  
  /**
   * Revogar todas as outras sessões
   */
  async revokeAllOtherSessions() {
    try {
      const response = await api.post('/auth/revoke-all-sessions');
      
      return {
        success: response.success || false,
        message: response.message || 'Todas as outras sessões foram revogadas'
      };
    } catch (error) {
      console.error('Revoke all sessions error:', error);
      return {
        success: false,
        message: 'Erro ao revogar sessões'
      };
    }
  }
}

// Instância única do serviço
const authService = new AuthService();

// Inicializar o serviço
authService.initialize();

// Configurar renovação automática
authService.setupAutoRefresh();

export default authService;