import axios from 'axios';

// Função para obter a URL base da API com base na configuração salva
const getApiBaseUrl = () => {
  const savedEnv = localStorage.getItem('apiEnvironment');
    // Prioridade: localStorage → variáveis de ambiente → padrão
  if (savedEnv === 'production') {
    return import.meta.env.VITE_API_URL_PRODUCTION || 'http://64.23.183.132/api';
  } else {
    return import.meta.env.VITE_API_URL_DEVELOPMENT || 'http://localhost:3001/api';
  }
};

// Criar instância do axios com URL base dinâmica
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sistema de toast simples como fallback
const showToast = (title, description, variant = 'default') => {
  // Criar toast manualmente se o sistema de toast não estiver disponível
  const toastElement = document.createElement('div');
  toastElement.className = `fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg shadow-lg p-4 ${
    variant === 'destructive' 
      ? 'bg-red-50 border-red-200 text-red-800' 
      : 'bg-white border-gray-200'
  }`;
  
  toastElement.innerHTML = `
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h4 class="font-semibold">${title}</h4>
        <p class="text-sm mt-1">${description}</p>
      </div>
      <button class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600">×</button>
    </div>
  `;
  
  // Adicionar evento de fechar
  const closeButton = toastElement.querySelector('button');
  closeButton.onclick = () => {
    toastElement.remove();
  };
  
  document.body.appendChild(toastElement);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (toastElement.parentNode) {
      toastElement.remove();
    }
  }, 5000);
};

// Função para atualizar a URL base da API
export const updateApiBaseUrl = (url) => {
  api.defaults.baseURL = url;
  
  // Disparar evento personalizado para notificar outros componentes
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apiEnvironmentChanged', { detail: { url } }));
  }
  
  // Mostrar notificação sobre a mudança de ambiente
  const isProduction = url.includes('api.roadrw.com.br');
  showToast(
    'Ambiente alterado', 
    `Agora usando o ambiente de ${isProduction ? 'produção' : 'desenvolvimento'}`,
    'default'
  );
};

// Tornar a função disponível globalmente para o componente EnvironmentSwitcher
if (typeof window !== 'undefined') {
  window.updateApiBaseUrl = updateApiBaseUrl;
}

// Função para obter token do localStorage
const getToken = () => localStorage.getItem('token');

// Função para salvar token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        baseURL: config.baseURL,
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
        baseURL: response.config.baseURL,
      });
    }
    
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro for 401 e não for na rota de login
    if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login')) {
      // Se já tentou fazer refresh, redireciona para login
      if (originalRequest._retry) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { token: refreshToken });
          const { token } = response.data;
          setAuthToken(token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Falha no refresh, redireciona para login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Tratamento de erros gerais
    if (error.response) {
      const message = error.response.data?.message || 'Erro ao processar requisição';
      
      // Mostrar toast de erro
      showToast('Erro', message, 'destructive');
      
      console.error('API Error:', {
        url: originalRequest.url,
        status: error.response.status,
        message,
        data: error.response.data,
        baseURL: originalRequest.baseURL,
      });
    } else if (error.request) {
      console.error('Network Error:', error.message);
      showToast('Erro de conexão', 'Não foi possível conectar ao servidor', 'destructive');
    }
    
    return Promise.reject(error);
  }
);

// Funções auxiliares para requisições
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiPatch = (url, data = {}, config = {}) => api.patch(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);

// Função para obter o ambiente atual
export const getCurrentEnvironment = () => {
  return localStorage.getItem('apiEnvironment') || 'development';
};

// Função para obter a URL atual da API
export const getCurrentApiUrl = () => {
  return api.defaults.baseURL;
};

// Configuração inicial da API
export const initializeApi = () => {
  const token = getToken();
  if (token) {
    setAuthToken(token);
  }
  
  // Forçar atualização da URL base
  const currentUrl = getApiBaseUrl();
  if (api.defaults.baseURL !== currentUrl) {
    api.defaults.baseURL = currentUrl;
    console.log('API inicializada com URL:', currentUrl);
  }

  

  
  // Garantir que a URL base esteja correta com base na configuração salva
  const savedEnv = localStorage.getItem('apiEnvironment');
  if (savedEnv) {
    const newUrl = getApiBaseUrl();
    if (api.defaults.baseURL !== newUrl) {
      updateApiBaseUrl(newUrl);
    }
  }
};

export default api;