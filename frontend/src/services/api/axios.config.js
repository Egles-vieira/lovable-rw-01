// src/services/api/axios.config.js

import axios from 'axios';
import { toast } from 'sonner';

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Requisição inválida');
          break;
          
        case 401:
          toast.error('Não autorizado. Faça login novamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403:
          toast.error('Você não tem permissão para esta ação');
          break;
          
        case 404:
          toast.error(data.message || 'Recurso não encontrado');
          break;
          
        case 409:
          toast.error(data.message || 'Conflito de dados');
          break;
          
        case 422:
          // Erros de validação
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.message || err);
            });
          } else {
            toast.error(data.message || 'Erro de validação');
          }
          break;
          
        case 429:
          toast.error('Muitas requisições. Tente novamente mais tarde.');
          break;
          
        case 500:
          toast.error('Erro interno do servidor');
          break;
          
        case 503:
          toast.error('Serviço temporariamente indisponível');
          break;
          
        default:
          toast.error(data.message || 'Erro ao processar requisição');
      }
    } else if (error.request) {
      // Erro de rede
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outro tipo de erro
      toast.error('Erro desconhecido');
    }
    
    return Promise.reject(error);
  }
);

export default api;