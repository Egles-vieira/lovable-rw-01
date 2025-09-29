// src/services/api/index.js

import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

let api = null;

export const initializeApi = () => {
  api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Interceptor de requisição
  api.interceptors.request.use(
    (config) => {
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
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast({
              title: "Sessão expirada",
              description: "Por favor, faça login novamente.",
              variant: "destructive"
            });
            break;
            
          case 403:
            toast({
              title: "Acesso negado",
              description: "Você não tem permissão para esta ação.",
              variant: "destructive"
            });
            break;
            
          case 404:
            toast({
              title: "Não encontrado",
              description: data.message || "Recurso não encontrado.",
              variant: "destructive"
            });
            break;
            
          case 422:
            if (data.errors && Array.isArray(data.errors)) {
              data.errors.forEach(err => {
                toast({
                  title: "Erro de validação",
                  description: err.message || err,
                  variant: "destructive"
                });
              });
            }
            break;
            
          case 500:
            toast({
              title: "Erro do servidor",
              description: "Ocorreu um erro interno. Tente novamente.",
              variant: "destructive"
            });
            break;
        }
      }
      
      return Promise.reject(error);
    }
  );

  return api;
};

export const getApi = () => {
  if (!api) {
    return initializeApi();
  }
  return api;
};

export default getApi;