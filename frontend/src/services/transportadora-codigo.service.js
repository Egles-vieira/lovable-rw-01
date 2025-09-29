// src/services/transportadora-codigo.service.js

import api from './api/axios.config';

const BASE_URL = '/transportadora-codigo-ocorrencia';

const transportadoraCodigoService = {
  /**
   * Listar códigos de uma transportadora
   */
  async getByTransportadora(transportadoraId, params = {}) {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(
      `/transportadoras/${transportadoraId}/codigos?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Buscar código por ID
   */
  async getById(id) {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Criar novo vínculo
   */
  async create(transportadoraId, data) {
    const response = await api.post(
      `/transportadoras/${transportadoraId}/codigos`,
      data
    );
    return response.data;
  },

  /**
   * Atualizar vínculo
   */
  async update(id, data) {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Deletar vínculo
   */
  async delete(id) {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Exportar vínculos de uma transportadora
   */
  async export(transportadoraId, format = 'xlsx') {
    const response = await api.get(
      `/transportadoras/${transportadoraId}/codigos/export`,
      {
        params: { format },
        responseType: 'blob'
      }
    );
    
    // Criar download automático
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vinculos_${transportadoraId}_${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  },

  /**
   * Importar vínculos em lote
   */
  async importBatch(transportadoraId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(
      `/transportadoras/${transportadoraId}/codigos/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  },
};

export default transportadoraCodigoService;