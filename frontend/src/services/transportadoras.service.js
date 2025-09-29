// src/services/transportadoras.service.js

import api from './api/axios.config';

const BASE_URL = '/transportadoras';

const transportadorasService = {
  /**
   * Listar todas as transportadoras com paginação e filtros
   */
  async getAll(params = {}) {
    const { page = 1, limit = 10, search, uf, integracaoOcorrencia } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) queryParams.append('search', search);
    if (uf) queryParams.append('uf', uf);
    if (integracaoOcorrencia) queryParams.append('integracaoOcorrencia', integracaoOcorrencia);

    const response = await api.get(`${BASE_URL}?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Buscar transportadora por ID
   */
  async getById(id) {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Criar nova transportadora
   */
  async create(data) {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  /**
   * Atualizar transportadora
   */
  async update(id, data) {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Deletar transportadora
   */
  async delete(id) {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Buscar transportadora por CNPJ
   */
  async getByCNPJ(cnpj) {
    const response = await api.get(`${BASE_URL}/cnpj/${cnpj}`);
    return response.data;
  },

  /**
   * Obter estatísticas de uma transportadora
   */
  async getStats(id) {
    const response = await api.get(`${BASE_URL}/${id}/stats`);
    return response.data;
  },

  /**
   * Exportar transportadoras
   */
  async export(format = 'xlsx') {
    const response = await api.get(`${BASE_URL}/export`, {
      params: { format },
      responseType: 'blob'
    });
    
    // Criar download automático
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transportadoras_${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  },

  /**
   * Importar transportadoras
   */
  async import(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`${BASE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default transportadorasService;