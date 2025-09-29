// src/services/api/transportadora-codigo-ocorrencia.service.js

import api from './axios.config';

const BASE_URL = '/transportadora-codigo-ocorrencia';

export const transportadoraCodigoService = {
  // Listar vínculos
  async list(params = {}) {
    const { page = 1, limit = 10, transportadora_id, codigo_ocorrencia_codigo } = params;
    
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(transportadora_id && { transportadora_id }),
      ...(codigo_ocorrencia_codigo && { codigo_ocorrencia_codigo })
    });

    const response = await api.get(`${BASE_URL}?${queryParams}`);
    return response.data;
  },

  // Buscar vínculo por ID
  async getById(id) {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Buscar vínculos por transportadora
  async getByTransportadora(transportadoraId, params = {}) {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams({ page, limit });
    const response = await api.get(
      `${BASE_URL}/transportadora/${transportadoraId}?${queryParams}`
    );
    return response.data;
  },

  // Buscar vínculos por código de ocorrência
  async getByCodigoOcorrencia(codigoOcorrencia, params = {}) {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams({ page, limit });
    const response = await api.get(
      `${BASE_URL}/codigo-ocorrencia/${codigoOcorrencia}?${queryParams}`
    );
    return response.data;
  },

  // Buscar vínculo específico
  async getVinculo(transportadoraId, codigoOcorrencia) {
    const response = await api.get(
      `${BASE_URL}/transportadora/${transportadoraId}/codigo/${codigoOcorrencia}`
    );
    return response.data;
  },

  // Criar vínculo
  async create(data) {
    const payload = {
      transportadora_id: parseInt(data.transportadora_id),
      codigo_ocorrencia_codigo: parseInt(data.codigo_ocorrencia_codigo),
      codigo: parseInt(data.codigo),
      descricao: data.descricao || null
    };

    const response = await api.post(BASE_URL, payload);
    return response.data;
  },

  // Criar múltiplos vínculos
  async createMultiple(vinculos) {
    const payload = {
      vinculos: vinculos.map(v => ({
        transportadora_id: parseInt(v.transportadora_id),
        codigo_ocorrencia_codigo: parseInt(v.codigo_ocorrencia_codigo),
        codigo: parseInt(v.codigo),
        descricao: v.descricao || null
      }))
    };

    const response = await api.post(`${BASE_URL}/multiple`, payload);
    return response.data;
  },

  // Atualizar vínculo
  async update(id, data) {
    const payload = {};
    
    if (data.codigo) payload.codigo = parseInt(data.codigo);
    if (data.descricao !== undefined) payload.descricao = data.descricao;

    const response = await api.put(`${BASE_URL}/${id}`, payload);
    return response.data;
  },

  // Deletar vínculo
  async delete(id) {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Deletar vínculos por transportadora
  async deleteByTransportadora(transportadoraId) {
    const response = await api.delete(
      `${BASE_URL}/transportadora/${transportadoraId}`
    );
    return response.data;
  },

  // Deletar vínculos por código de ocorrência
  async deleteByCodigoOcorrencia(codigoOcorrencia) {
    const response = await api.delete(
      `${BASE_URL}/codigo-ocorrencia/${codigoOcorrencia}`
    );
    return response.data;
  },

  // Obter estatísticas
  async getStats() {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  },

  // Importar vínculos de CSV
  async importCSV(file, transportadoraId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('transportadora_id', transportadoraId);

    const response = await api.post(`${BASE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Exportar vínculos
  async export(params = {}) {
    const { transportadora_id, format = 'csv' } = params;
    
    const queryParams = new URLSearchParams({
      format,
      ...(transportadora_id && { transportadora_id })
    });

    const response = await api.get(`${BASE_URL}/export?${queryParams}`, {
      responseType: 'blob'
    });
    
    return response.data;
  }
};