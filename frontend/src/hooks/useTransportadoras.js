// src/hooks/useTransportadoras.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transportadorasService from '@/services/transportadoras.service';

/**
 * Hook para listar transportadoras com paginação e filtros
 */
export function useTransportadoras(params = {}) {
  return useQuery({
    queryKey: ['transportadoras', params],
    queryFn: () => transportadorasService.getAll(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar uma transportadora por ID
 */
export function useTransportadora(id) {
  return useQuery({
    queryKey: ['transportadora', id],
    queryFn: () => transportadorasService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar uma nova transportadora
 */
export function useCreateTransportadora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => transportadorasService.create(data),
    onSuccess: () => {
      // Invalidar cache de transportadoras
      queryClient.invalidateQueries(['transportadoras']);
    },
  });
}

/**
 * Hook para atualizar uma transportadora
 */
export function useUpdateTransportadora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => transportadorasService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar cache específico e lista
      queryClient.invalidateQueries(['transportadora', variables.id]);
      queryClient.invalidateQueries(['transportadoras']);
    },
  });
}

/**
 * Hook para deletar uma transportadora
 */
export function useDeleteTransportadora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => transportadorasService.delete(id),
    onSuccess: () => {
      // Invalidar cache de transportadoras
      queryClient.invalidateQueries(['transportadoras']);
    },
  });
}

/**
 * Hook para buscar estatísticas de uma transportadora
 */
export function useTransportadoraStats(id) {
  return useQuery({
    queryKey: ['transportadora', id, 'stats'],
    queryFn: () => transportadorasService.getStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}