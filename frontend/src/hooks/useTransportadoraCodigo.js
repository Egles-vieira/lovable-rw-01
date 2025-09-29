// src/hooks/useTransportadoraCodigo.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transportadoraCodigoService from '@/services/transportadora-codigo.service';

/**
 * Hook para listar códigos de uma transportadora
 */
export function useCodigosByTransportadora(transportadoraId, params = {}) {
  return useQuery({
    queryKey: ['transportadora-codigos', transportadoraId, params],
    queryFn: () => transportadoraCodigoService.getByTransportadora(transportadoraId, params),
    enabled: !!transportadoraId,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar um código específico
 */
export function useTransportadoraCodigo(id) {
  return useQuery({
    queryKey: ['transportadora-codigo', id],
    queryFn: () => transportadoraCodigoService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar novo vínculo
 */
export function useCreateTransportadoraCodigo() {
  const queryClient = useQueryClient();

return useMutation({
    mutationFn: ({ transportadoraId, data }) => 
      transportadoraCodigoService.create(transportadoraId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['transportadora-codigos', variables.transportadoraId]);
    },
  });
}

/**
 * Hook para atualizar vínculo
 */
export function useUpdateTransportadoraCodigo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => 
      transportadoraCodigoService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['transportadora-codigo', data.id]);
      queryClient.invalidateQueries(['transportadora-codigos']);
    },
  });
}

/**
 * Hook para deletar vínculo
 */
export function useDeleteTransportadoraCodigo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => transportadoraCodigoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['transportadora-codigos']);
    },
  });
}

/**
 * Hook para exportar vínculos
 */
export function useExportVinculos() {
  return useMutation({
    mutationFn: (transportadoraId) => 
      transportadoraCodigoService.export(transportadoraId),
  });
}