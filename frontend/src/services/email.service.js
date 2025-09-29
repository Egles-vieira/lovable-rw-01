// src/services/email.service.js
import api from './api';

/**
 * Configurações de provedores de e-mail
 */
const EMAIL_PROVIDERS = {
  smtp: {
    name: 'SMTP Customizado',
    icon: '📧',
    description: 'Configuração SMTP personalizada',
    fields: [
      { key: 'host', label: 'Servidor SMTP', type: 'text', required: true, placeholder: 'smtp.gmail.com' },
      { key: 'port', label: 'Porta', type: 'number', required: true, placeholder: '587' },
      { key: 'secure', label: 'SSL/TLS', type: 'boolean', required: false, default: false },
      { key: 'username', label: 'Usuário', type: 'text', required: true, placeholder: 'seu@email.com' },
      { key: 'password', label: 'Senha', type: 'password', required: true, placeholder: 'senha_do_app' },
      { key: 'from_name', label: 'Nome do Remetente', type: 'text', required: false, placeholder: 'Road-RW Logística' },
      { key: 'from_email', label: 'E-mail do Remetente', type: 'email', required: true, placeholder: 'naoresponda@roadrw.com' }
    ]
  },
  gmail: {
    name: 'Gmail',
    icon: '📮',
    description: 'Integração com Gmail usando OAuth2',
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', required: true, placeholder: 'Google OAuth Client ID' },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true, placeholder: 'Google OAuth Secret' },
      { key: 'refresh_token', label: 'Refresh Token', type: 'password', required: true, placeholder: 'Token de atualização' },
      { key: 'from_name', label: 'Nome do Remetente', type: 'text', required: false, placeholder: 'Road-RW Logística' },
      { key: 'from_email', label: 'E-mail do Remetente', type: 'email', required: true, placeholder: 'naoresponda@roadrw.com' }
    ]
  },
  sendgrid: {
    name: 'SendGrid',
    icon: '📬',
    description: 'Serviço de e-mail SendGrid',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'SG.xxxxx' },
      { key: 'from_name', label: 'Nome do Remetente', type: 'text', required: false, placeholder: 'Road-RW Logística' },
      { key: 'from_email', label: 'E-mail do Remetente', type: 'email', required: true, placeholder: 'naoresponda@roadrw.com' },
      { key: 'template_id', label: 'Template ID (opcional)', type: 'text', required: false, placeholder: 'd-xxxxx' }
    ]
  },
  mailgun: {
    name: 'Mailgun',
    icon: '📯',
    description: 'Serviço de e-mail Mailgun',
    fields: [
      { key: 'domain', label: 'Domínio', type: 'text', required: true, placeholder: 'mg.seudominio.com' },
      { key: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'key-xxxxx' },
      { key: 'region', label: 'Região', type: 'select', required: true, options: [
        { value: 'us', label: 'Estados Unidos' },
        { value: 'eu', label: 'Europa' }
      ]},
      { key: 'from_name', label: 'Nome do Remetente', type: 'text', required: false, placeholder: 'Road-RW Logística' },
      { key: 'from_email', label: 'E-mail do Remetente', type: 'email', required: true, placeholder: 'naoresponda@roadrw.com' }
    ]
  },
  ses: {
    name: 'Amazon SES',
    icon: '📦',
    description: 'Amazon Simple Email Service',
    fields: [
      { key: 'region', label: 'Região AWS', type: 'select', required: true, options: [
        { value: 'us-east-1', label: 'US East (N. Virginia)' },
        { value: 'us-west-2', label: 'US West (Oregon)' },
        { value: 'eu-west-1', label: 'Europe (Ireland)' },
        { value: 'sa-east-1', label: 'South America (São Paulo)' }
      ]},
      { key: 'access_key_id', label: 'Access Key ID', type: 'text', required: true, placeholder: 'AKIAXXXXX' },
      { key: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true, placeholder: 'xxxxx' },
      { key: 'from_name', label: 'Nome do Remetente', type: 'text', required: false, placeholder: 'Road-RW Logística' },
      { key: 'from_email', label: 'E-mail do Remetente', type: 'email', required: true, placeholder: 'naoresponda@roadrw.com' }
    ]
  }
};

class EmailService {
  constructor() {
    this.currentProvider = this.getCurrentProvider();
    this.config = this.getCurrentConfig();
  }

  /**
   * Obter provedor atual
   */
  getCurrentProvider() {
    return localStorage.getItem('emailProvider') || 'smtp';
  }

  /**
   * Obter configuração atual
   */
  getCurrentConfig() {
    try {
      const config = localStorage.getItem('emailConfig');
      return config ? JSON.parse(config) : {};
    } catch (error) {
      console.error('Erro ao obter configuração de e-mail:', error);
      return {};
    }
  }

  /**
   * Definir provedor e configuração
   */
  setProviderConfig(provider, config) {
    localStorage.setItem('emailProvider', provider);
    localStorage.setItem('emailConfig', JSON.stringify(config));
    this.currentProvider = provider;
    this.config = config;

    // Disparar evento para notificar mudanças
    window.dispatchEvent(new CustomEvent('emailProviderChanged', {
      detail: { provider, config }
    }));
  }

  /**
   * Obter lista de provedores disponíveis
   */
  getAvailableProviders() {
    return EMAIL_PROVIDERS;
  }

  /**
   * Obter configuração do provedor
   */
  getProviderConfig(provider) {
    return EMAIL_PROVIDERS[provider] || null;
  }

  /**
   * Validar configuração
   */
  validateConfig(provider, config) {
    const providerConfig = EMAIL_PROVIDERS[provider];
    if (!providerConfig) {
      return { valid: false, errors: ['Provedor não encontrado'] };
    }

    const errors = [];
    
    providerConfig.fields.forEach(field => {
      if (field.required && (!config[field.key] || config[field.key].toString().trim() === '')) {
        errors.push(`${field.label} é obrigatório`);
      }
      
      // Validações específicas
      if (config[field.key]) {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(config[field.key])) {
              errors.push(`${field.label} deve ser um e-mail válido`);
            }
            break;
          case 'number':
            if (isNaN(config[field.key])) {
              errors.push(`${field.label} deve ser um número`);
            }
            break;
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Testar configuração de e-mail
   */
  async testEmailConfig(provider = null, config = null) {
    try {
      const testProvider = provider || this.currentProvider;
      const testConfig = config || this.config;

      const response = await api.post('/email/test', {
        provider: testProvider,
        config: testConfig
      });

      return {
        success: response.success || false,
        message: response.message || 'Teste realizado'
      };
    } catch (error) {
      console.error('Erro ao testar configuração de e-mail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao testar configuração'
      };
    }
  }

  /**
   * Salvar configuração no servidor
   */
  async saveEmailConfig(provider, config) {
    try {
      const response = await api.post('/email/config', {
        provider,
        config
      });

      if (response.success) {
        this.setProviderConfig(provider, config);
        return { success: true, message: 'Configuração salva com sucesso' };
      }

      return {
        success: false,
        message: response.message || 'Erro ao salvar configuração'
      };
    } catch (error) {
      console.error('Erro ao salvar configuração de e-mail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao salvar configuração'
      };
    }
  }

  /**
   * Obter configuração do servidor
   */
  async loadEmailConfig() {
    try {
      const response = await api.get('/email/config');

      if (response.success && response.data) {
        const { provider, config } = response.data;
        this.setProviderConfig(provider, config);
        return { success: true, provider, config };
      }

      return {
        success: false,
        message: response.message || 'Configuração não encontrada'
      };
    } catch (error) {
      console.error('Erro ao carregar configuração de e-mail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar configuração'
      };
    }
  }

  /**
   * Enviar e-mail
   */
  async sendEmail(emailData) {
    try {
      const response = await api.post('/email/send', {
        ...emailData,
        provider: this.currentProvider,
        config: this.config
      });

      return {
        success: response.success || false,
        message: response.message || 'E-mail enviado',
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao enviar e-mail'
      };
    }
  }

  /**
   * Enviar e-mail de template
   */
  async sendTemplateEmail(template, data, recipient) {
    return this.sendEmail({
      template,
      data,
      to: recipient,
      use_template: true
    });
  }

  /**
   * Obter templates disponíveis
   */
  async getEmailTemplates() {
    try {
      const response = await api.get('/email/templates');

      return {
        success: response.success || false,
        templates: response.data?.templates || []
      };
    } catch (error) {
      console.error('Erro ao obter templates:', error);
      return {
        success: false,
        templates: []
      };
    }
  }

  /**
   * Obter estatísticas de e-mail
   */
  async getEmailStats(period = '30d') {
    try {
      const response = await api.get(`/email/stats?period=${period}`);

      return {
        success: response.success || false,
        stats: response.data?.stats || {}
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        stats: {}
      };
    }
  }

  /**
   * Limpar configuração
   */
  clearConfig() {
    localStorage.removeItem('emailProvider');
    localStorage.removeItem('emailConfig');
    this.currentProvider = 'smtp';
    this.config = {};

    window.dispatchEvent(new CustomEvent('emailProviderChanged', {
      detail: { provider: null, config: {} }
    }));
  }

  /**
   * Criptografar configuração sensível
   */
  encryptSensitiveData(config) {
    const sensitiveFields = ['password', 'api_key', 'client_secret', 'secret_access_key', 'refresh_token'];
    const encryptedConfig = { ...config };

    sensitiveFields.forEach(field => {
      if (encryptedConfig[field]) {
        // Em produção, usar uma biblioteca de criptografia real
        encryptedConfig[field] = btoa(encryptedConfig[field]);
      }
    });

    return encryptedConfig;
  }

  /**
   * Descriptografar configuração sensível
   */
  decryptSensitiveData(config) {
    const sensitiveFields = ['password', 'api_key', 'client_secret', 'secret_access_key', 'refresh_token'];
    const decryptedConfig = { ...config };

    sensitiveFields.forEach(field => {
      if (decryptedConfig[field]) {
        try {
          // Em produção, usar uma biblioteca de criptografia real
          decryptedConfig[field] = atob(decryptedConfig[field]);
        } catch (error) {
          console.warn(`Erro ao descriptografar ${field}:`, error);
        }
      }
    });

    return decryptedConfig;
  }
}

// Instância única do serviço
const emailService = new EmailService();

export default emailService;
export { EMAIL_PROVIDERS };