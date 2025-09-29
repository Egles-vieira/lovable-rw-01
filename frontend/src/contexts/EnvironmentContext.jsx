// src/contexts/EnvironmentContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const EnvironmentContext = createContext();

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

export const EnvironmentProvider = ({ children }) => {
  const [environment, setEnvironment] = useState('development');
  const [apiUrl, setApiUrl] = useState('');

  // Carregar configuração salva ao inicializar
  useEffect(() => {
    const savedEnv = localStorage.getItem('apiEnvironment') || 'development';
    const url = getApiUrlForEnvironment(savedEnv);
    
    setEnvironment(savedEnv);
    setApiUrl(url);
    
    // Atualizar a API globalmente
    if (window.updateApiBaseUrl) {
      window.updateApiBaseUrl(url);
    }
  }, []);

  const getApiUrlForEnvironment = (env) => {
    return env === 'production' 
      ? (import.meta.env.VITE_API_URL_PRODUCTION || 'http://64.23.183.132/api')
      : (import.meta.env.VITE_API_URL_DEVELOPMENT || 'http://localhost:3001/api');
  };

  const setEnvironmentConfig = (newEnvironment) => {
    const newUrl = getApiUrlForEnvironment(newEnvironment);
    
    // Salvar no localStorage
    localStorage.setItem('apiEnvironment', newEnvironment);
    
    // Atualizar estado
    setEnvironment(newEnvironment);
    setApiUrl(newUrl);
    
    // Atualizar API globalmente
    if (window.updateApiBaseUrl) {
      window.updateApiBaseUrl(newUrl);
    }
    
    // Disparar evento global para outros componentes
    window.dispatchEvent(new CustomEvent('environmentChanged', {
      detail: { environment: newEnvironment, apiUrl: newUrl }
    }));

    return newUrl;
  };

  const value = {
    environment,
    apiUrl,
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
    setEnvironment: setEnvironmentConfig
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};