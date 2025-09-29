// src/hooks/useEnvironment.js
import { useState, useEffect } from 'react';

export const useEnvironment = () => {
  const [environment, setEnvironment] = useState('development');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const savedEnv = localStorage.getItem('apiEnvironment') || 'development';
    const url = savedEnv === 'production' 
      ? (import.meta.env.VITE_API_URL_PRODUCTION || 'https://64.23.183.132/api')
      : (import.meta.env.VITE_API_URL_DEVELOPMENT || 'http://localhost:3001/api');
    
    setEnvironment(savedEnv);
    setApiUrl(url);
  }, []);

  const setEnvironmentConfig = (newEnvironment) => {
    localStorage.setItem('apiEnvironment', newEnvironment);
    const newUrl = newEnvironment === 'production'
      ? (import.meta.env.VITE_API_URL_PRODUCTION || 'https://64.23.183.132/api')
      : (import.meta.env.VITE_API_URL_DEVELOPMENT || 'http://localhost:3001/api');
    
    setEnvironment(newEnvironment);
    setApiUrl(newUrl);

    // Disparar evento global
    window.dispatchEvent(new CustomEvent('environmentChanged', { 
      detail: { environment: newEnvironment, apiUrl: newUrl } 
    }));
  };

  return {
    environment,
    apiUrl,
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
    setEnvironment: setEnvironmentConfig
  };
};