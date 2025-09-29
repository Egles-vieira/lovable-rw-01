// src/services/api/transportadoras.service.js

import { getApi } from './index';

const BASE_URL = '/transportadoras';

export const transportadorasService = {
  // Listar transportadoras com paginação
  async list(params = {}) {
    const api = getApi();
    const { page = 1, limit = 10, nome, uf, ...filters } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(nome && { nome }),
      ...(uf && { uf }),
      ...filters
    });

    const response = await api.get(`${BASE_URL}?${queryParams}`);
    return response.data;
  },

  // Buscar transportadora por ID
  async getById(id) {
    const api = getApi();
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Buscar por CNPJ
  async getByCnpj(cnpj) {
    const api = getApi();
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    const response = await api.get(`${BASE_URL}/cnpj/${cnpjLimpo}`);
    return response.data;
  },

  // Buscar por UF
  async getByUf(uf) {
    const api = getApi();
    const response = await api.get(`${BASE_URL}/uf/${uf}`);
    return response.data;
  },

  // Buscar transportadoras (search)
  async search(query, limit = 10) {
    const api = getApi();
    const response = await api.get(`${BASE_URL}/search`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  // Criar transportadora
  async create(data) {
    const api = getApi();
    const payload = {
      cnpj: data.cnpj.replace(/\D/g, ''),
      nome: data.nome.trim(),
      endereco: data.endereco.trim(),
      municipio: data.municipio.trim(),
      uf: data.uf.toUpperCase(),
      integracao_ocorrencia: data.integracao_ocorrencia || null,
      romaneio_auto: data.romaneio_auto || false,
      roterizacao_automatica: data.roterizacao_automatica || false
    };

    const response = await api.post(BASE_URL, payload);
    return response.data;
  },

  // Atualizar transportadora
  async update(id, data) {
    const api = getApi();
    const payload = {};
    
    if (data.cnpj) payload.cnpj = data.cnpj.replace(/\D/g, '');
    if (data.nome) payload.nome = data.nome.trim();
    if (data.endereco) payload.endereco = data.endereco.trim();
    if (data.municipio) payload.municipio = data.municipio.trim();
    if (data.uf) payload.uf = data.uf.toUpperCase();
    if (data.integracao_ocorrencia !== undefined) payload.integracao_ocorrencia = data.integracao_ocorrencia;
    if (data.romaneio_auto !== undefined) payload.romaneio_auto = data.romaneio_auto;
    if (data.roterizacao_automatica !== undefined) payload.roterizacao_automatica = data.roterizacao_automatica;

    const response = await api.put(`${BASE_URL}/${id}`, payload);
    return response.data;
  },

  // Deletar transportadora
  async delete(id) {
    const api = getApi();
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Restaurar transportadora
  async restore(id) {
    const api = getApi();
    const response = await api.post(`${BASE_URL}/${id}/restore`);
    return response.data;
  },

  // Obter estatísticas
  async getStats() {
    const api = getApi();
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  },

  // Validar CNPJ
  async validateCnpj(cnpj) {
    const api = getApi();
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    const response = await api.get(`${BASE_URL}/validate-cnpj/${cnpjLimpo}`);
    return response.data;
  }
};