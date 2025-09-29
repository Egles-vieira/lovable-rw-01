// src/hooks/useEmail.js
import { useState, useCallback } from 'react';
import { useEmail as useEmailContext } from '@/contexts/EmailContext';

/**
 * Hook para configuração de e-mail
 */
export const useEmailConfig = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const emailContext = useEmailContext();

  // Salvar configuração
  const saveConfiguration = useCallback(async (provider, config) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const result = await emailContext.saveConfig(provider, config);

      if (result.success) {
        setSuccess('Configuração salva com sucesso!');
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (err) {
      const errorMessage = 'Erro ao salvar configuração';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [emailContext]);

  // Testar configuração
  const testConfiguration = useCallback(async (provider = null, config = null) => {
    try {
      setIsTesting(true);
      setError(null);
      setSuccess(null);

      const result = await emailContext.testConfig(provider, config);

      if (result.success) {
        setSuccess('Teste realizado com sucesso!');
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao testar configuração';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsTesting(false);
    }
  }, [emailContext]);

  // Limpar mensagens
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    isSaving,
    isTesting,
    error,
    success,
    saveConfiguration,
    testConfiguration,
    clearMessages,
    ...emailContext
  };
};

/**
 * Hook para envio de e-mails
 */
export const useEmailSender = () => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { sendEmail, sendTemplateEmail, isConfigured } = useEmailContext();

  // Enviar e-mail simples
  const send = useCallback(async (emailData) => {
    if (!isConfigured) {
      setError('Configuração de e-mail não encontrada');
      return { success: false, message: 'Configuração de e-mail não encontrada' };
    }

    try {
      setIsSending(true);
      setError(null);
      setSuccess(null);

      const result = await sendEmail(emailData);

      if (result.success) {
        setSuccess('E-mail enviado com sucesso!');
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao enviar e-mail';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSending(false);
    }
  }, [sendEmail, isConfigured]);

  // Enviar e-mail de template
  const sendTemplate = useCallback(async (template, data, recipient) => {
    if (!isConfigured) {
      setError('Configuração de e-mail não encontrada');
      return { success: false, message: 'Configuração de e-mail não encontrada' };
    }

    try {
      setIsSending(true);
      setError(null);
      setSuccess(null);

      const result = await sendTemplateEmail(template, data, recipient);

      if (result.success) {
        setSuccess('E-mail enviado com sucesso!');
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = 'Erro ao enviar e-mail';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSending(false);
    }
  }, [sendTemplateEmail, isConfigured]);

  // Limpar mensagens
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    isSending,
    error,
    success,
    send,
    sendTemplate,
    clearMessages,
    isConfigured
  };
};

/**
 * Hook para templates de e-mail
 */
export const useEmailTemplates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);

  const { getTemplates } = useEmailContext();

  // Carregar templates
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getTemplates();

      if (result.success) {
        setTemplates(result.templates);
        return { success: true, templates: result.templates };
      } else {
        setError('Erro ao carregar templates');
        return { success: false, templates: [] };
      }
    } catch (err) {
      const errorMessage = 'Erro ao carregar templates';
      setError(errorMessage);
      return { success: false, templates: [] };
    } finally {
      setIsLoading(false);
    }
  }, [getTemplates]);

  // Buscar template por ID
  const getTemplate = useCallback((templateId) => {
    return templates.find(template => template.id === templateId) || null;
  }, [templates]);

  // Filtrar templates por categoria
  const getTemplatesByCategory = useCallback((category) => {
    return templates.filter(template => template.category === category);
  }, [templates]);

  return {
    isLoading,
    templates,
    error,
    loadTemplates,
    getTemplate,
    getTemplatesByCategory
  };
};

/**
 * Hook para estatísticas de e-mail
 */
export const useEmailStats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  const { getStats } = useEmailContext();

  // Carregar estatísticas
  const loadStats = useCallback(async (period = '30d') => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getStats(period);

      if (result.success) {
        setStats(result.stats);
        return { success: true, stats: result.stats };
      } else {
        setError('Erro ao carregar estatísticas');
        return { success: false, stats: {} };
      }
    } catch (err) {
      const errorMessage = 'Erro ao carregar estatísticas';
      setError(errorMessage);
      return { success: false, stats: {} };
    } finally {
      setIsLoading(false);
    }
  }, [getStats]);

  // Obter taxa de entrega
  const getDeliveryRate = useCallback(() => {
    if (!stats.sent || !stats.delivered) return 0;
    return ((stats.delivered / stats.sent) * 100).toFixed(2);
  }, [stats]);

  // Obter taxa de abertura
  const getOpenRate = useCallback(() => {
    if (!stats.delivered || !stats.opened) return 0;
    return ((stats.opened / stats.delivered) * 100).toFixed(2);
  }, [stats]);

  // Obter taxa de clique
  const getClickRate = useCallback(() => {
    if (!stats.delivered || !stats.clicked) return 0;
    return ((stats.clicked / stats.delivered) * 100).toFixed(2);
  }, [stats]);

  return {
    isLoading,
    stats,
    error,
    loadStats,
    getDeliveryRate,
    getOpenRate,
    getClickRate
  };
};

/**
 * Hook para gerenciamento global de configurações de mensageria
 */
export const useMessagingConfig = () => {
  const [globalConfig, setGlobalConfig] = useState({
    email: {},
    sms: {},
    push: {},
    webhook: {}
  });

  const emailConfig = useEmailConfig();

  // Carregar todas as configurações
  const loadAllConfigurations = useCallback(async () => {
    try {
      // Carregar configuração de email
      const emailResult = await emailConfig.loadConfig();
      
      // Aqui você pode adicionar outras configurações (SMS, Push, etc.)
      // const smsResult = await smsConfig.loadConfig();
      // const pushResult = await pushConfig.loadConfig();

      setGlobalConfig(prev => ({
        ...prev,
        email: emailResult.success ? { provider: emailResult.provider, config: emailResult.config } : {}
      }));

      return { success: true };
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return { success: false, message: 'Erro ao carregar configurações' };
    }
  }, [emailConfig]);

  // Obter status global
  const getGlobalStatus = useCallback(() => {
    const emailStatus = emailConfig.getConfigStatus();
    
    return {
      email: {
        configured: emailStatus.isCurrentConfigured,
        provider: emailStatus.currentProvider,
        lastTest: emailStatus.lastTest
      },
      // Adicione outros serviços aqui
      sms: { configured: false },
      push: { configured: false },
      webhook: { configured: false }
    };
  }, [emailConfig]);

  // Verificar se pelo menos um serviço está configurado
  const hasAnyService = useCallback(() => {
    const status = getGlobalStatus();
    return Object.values(status).some(service => service.configured);
  }, [getGlobalStatus]);

  return {
    globalConfig,
    loadAllConfigurations,
    getGlobalStatus,
    hasAnyService,
    email: emailConfig
  };
};