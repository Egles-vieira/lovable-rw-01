import axios from 'axios';
import config from '../../../frontend/src/config/api.js';

// Criar instância do axios com configuração centralizada
const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: config.headers
});

// Interceptador para requests (adicionar token, logs, etc.)
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autorização se existir
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptador para responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} - ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} - ${error.config?.url}`);
    
    // Tratamento global de erros
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;