// src/contexts/EmailContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import emailService, { EMAIL_PROVIDERS } from '@/services/email.service';

// Criar contexto
const EmailContext = createContext(null);

// Hook para usar o contexto
export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail deve ser usado dentro de um EmailProvider');
  }
  return context;
};

// Provider do contexto
export const EmailProvider = ({ children }) => {
  const [currentProvider, setCurrentProvider] = useState('smtp');
  const [currentConfig, setCurrentConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);
  
  // Carregar configuração inicial
  useEffect(() => {
    const provider = emailService.getCurrentProvider();
    const config = emailService.getCurrentConfig();
    
    setCurrentProvider(provider);
    setCurrentConfig(config);
    setIsConfigured(Object.keys(config).length > 0);
  }, []);

  // Listener para mudanças de configuração
  useEffect(() => {
    const handleEmailProviderChange = (event) => {
      const { provider, config } = event.detail;
      if (provider) {
        setCurrentProvider(provider);
        setCurrentConfig(config || {});
        setIsConfigured(Object.keys(config || {}).length > 0);
      }
    };

    window.addEventListener('emailProviderChanged', handleEmailProviderChange);
    
    return () => {
      window.removeEventListener('emailProviderChanged', handleEmailProviderChange);
    };
  }, []);

  // Obter provedores disponíveis
  const getProviders = useCallback(() => {
    return EMAIL_PROVIDERS;
  }, []);

  // Obter configuração do provedor
  const getProviderConfig = useCallback((provider) => {
    return emailService.getProviderConfig(provider);
  }, []);

  // Validar configuração
  const validateConfig = useCallback((provider, config) => {
    return emailService.validateConfig(provider, config);
  }, []);

  // Salvar configuração
  const saveConfig = useCallback(async (provider, config) => {
    try {
      setIsLoading(true);
      
      // Validar configuração
      const validation = validateConfig(provider, config);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Configuração inválida',
          errors: validation.errors
        };
      }

      // Salvar no serviço
      const result = await emailService.saveEmailConfig(provider, config);
      
      if (result.success) {
        setCurrentProvider(provider);
        setCurrentConfig(config);
        setIsConfigured(true);
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      return {
        success: false,
        message: 'Erro inesperado ao salvar configuração'
      };
    } finally {
      setIsLoading(false);
    }
  }, [validateConfig]);

  // Testar configuração
  const testConfig = useCallback(async (provider = null, config = null) => {
    try {
      setIsLoading(true);
      
      const result = await emailService.testEmailConfig(provider, config);
      setLastTestResult(result);
      
      return result;
    } catch (error) {
      console.error('Erro ao testar configuração:', error);
      const result = {
        success: false,
        message: 'Erro ao testar configuração'
      };
      setLastTestResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar configuração do servidor
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const result = await emailService.loadEmailConfig();
      
      if (result.success) {
        setCurrentProvider(result.provider);
        setCurrentConfig(result.config);
        setIsConfigured(true);
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      return {
        success: false,
        message: 'Erro ao carregar configuração'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar e-mail
  const sendEmail = useCallback(async (emailData) => {
    if (!isConfigured) {
      return {
        success: false,
        message: 'Configuração de e-mail não encontrada'
      };
    }

    try {
      setIsLoading(true);
      return await emailService.sendEmail(emailData);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return {
        success: false,
        message: 'Erro ao enviar e-mail'
      };
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  // Enviar e-mail de template
  const sendTemplateEmail = useCallback(async (template, data, recipient) => {
    return sendEmail({
      template,
      data,
      to: recipient,
      use_template: true
    });
  }, [sendEmail]);

  // Obter templates
  const getTemplates = useCallback(async () => {
    try {
      return await emailService.getEmailTemplates();
    } catch (error) {
      console.error('Erro ao obter templates:', error);
      return {
        success: false,
        templates: []
      };
    }
  }, []);

  // Obter estatísticas
  const getStats = useCallback(async (period = '30d') => {
    try {
      return await emailService.getEmailStats(period);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        stats: {}
      };
    }
  }, []);

  // Limpar configuração
  const clearConfig = useCallback(() => {
    emailService.clearConfig();
    setCurrentProvider('smtp');
    setCurrentConfig({});
    setIsConfigured(false);
    setLastTestResult(null);
  }, []);

  // Verificar se provedor está configurado
  const isProviderConfigured = useCallback((provider) => {
    if (provider !== currentProvider) return false;
    
    const providerConfig = getProviderConfig(provider);
    if (!providerConfig) return false;

    const requiredFields = providerConfig.fields.filter(field => field.required);
    return requiredFields.every(field => 
      currentConfig[field.key] && 
      currentConfig[field.key].toString().trim() !== ''
    );
  }, [currentProvider, currentConfig, getProviderConfig]);

  // Obter status da configuração
  const getConfigStatus = useCallback(() => {
    const providers = Object.keys(EMAIL_PROVIDERS);
    const configuredProviders = providers.filter(provider => 
      isProviderConfigured(provider)
    );

    return {
      totalProviders: providers.length,
      configuredProviders: configuredProviders.length,
      currentProvider,
      isCurrentConfigured: isProviderConfigured(currentProvider),
      lastTest: lastTestResult,
      hasAnyConfiguration: configuredProviders.length > 0
    };
  }, [currentProvider, isProviderConfigured, lastTestResult]);

  // Obter informações do provedor atual
  const getCurrentProviderInfo = useCallback(() => {
    const providerConfig = getProviderConfig(currentProvider);
    return {
      provider: currentProvider,
      config: currentConfig,
      providerInfo: providerConfig,
      isConfigured: isProviderConfigured(currentProvider),
      validation: validateConfig(currentProvider, currentConfig)
    };
  }, [currentProvider, currentConfig, getProviderConfig, isProviderConfigured, validateConfig]);

  const value = {
    // Estado
    currentProvider,
    currentConfig,
    isLoading,
    isConfigured,
    lastTestResult,

    // Ações
    saveConfig,
    testConfig,
    loadConfig,
    clearConfig,
    sendEmail,
    sendTemplateEmail,

    // Utilitários
    getProviders,
    getProviderConfig,
    validateConfig,
    getTemplates,
    getStats,
    isProviderConfigured,
    getConfigStatus,
    getCurrentProviderInfo
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};