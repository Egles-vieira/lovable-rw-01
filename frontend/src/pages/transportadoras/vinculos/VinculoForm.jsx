// src/pages/transportadoras/vinculos/VinculoForm.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useTransportadoraCodigo,
  useCreateTransportadoraCodigo,
  useUpdateTransportadoraCodigo,
} from '@/hooks/useTransportadoraCodigo';
import { useTransportadora } from '@/hooks/useTransportadoras';

// Schema de validação
const vinculoSchema = z.object({
  transportadora_id: z.number().int().positive(),
  codigo_ocorrencia_codigo: z.number().int().positive({
    message: 'Código de ocorrência é obrigatório'
  }),
  codigo: z.number().int().positive({
    message: 'Código da transportadora é obrigatório'
  }),
  descricao: z.string().max(1000).optional().nullable(),
});

export default function VinculoForm() {
  const navigate = useNavigate();
  const { transportadoraId, vinculoId } = useParams();
  const isEdit = !!vinculoId;

  const [codigosOcorrencia, setCodigosOcorrencia] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transportadora } = useTransportadora(transportadoraId);
  const { data: vinculoData, isLoading: loadingData } = useTransportadoraCodigo(vinculoId);
  const createMutation = useCreateTransportadoraCodigo();
  const updateMutation = useUpdateTransportadoraCodigo();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(vinculoSchema),
    defaultValues: {
      transportadora_id: parseInt(transportadoraId),
      codigo_ocorrencia_codigo: null,
      codigo: null,
      descricao: '',
    }
  });

  // Carregar dados ao editar
  useEffect(() => {
    if (isEdit && vinculoData?.data) {
      const v = vinculoData.data;
      setValue('codigo_ocorrencia_codigo', v.codigo_ocorrencia_codigo);
      setValue('codigo', v.codigo);
      setValue('descricao', v.descricao || '');
    }
  }, [isEdit, vinculoData, setValue]);

  // Simulação de busca de códigos de ocorrência
  // TODO: Implementar busca real na API
  useEffect(() => {
    // Mock data - substituir por chamada real à API
    const mockCodigos = [
      { codigo: 1, descricao: 'Entrega Realizada', tipo: 'ENTREGA' },
      { codigo: 2, descricao: 'Destinatário Ausente', tipo: 'PROCESSO' },
      { codigo: 3, descricao: 'Endereço Incorreto', tipo: 'PROCESSO' },
      { codigo: 4, descricao: 'Mercadoria Avariada', tipo: 'PROCESSO' },
      { codigo: 5, descricao: 'Devolução ao Remetente', tipo: 'FINALIZADORA' },
    ];
    
    if (searchTerm) {
      const filtered = mockCodigos.filter(c => 
        c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.codigo.toString().includes(searchTerm)
      );
      setCodigosOcorrencia(filtered);
    } else {
      setCodigosOcorrencia(mockCodigos);
    }
  }, [searchTerm]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: vinculoId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate(`/transportadoras/${transportadoraId}/vinculos`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  if (isEdit && loadingData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/transportadoras/${transportadoraId}/vinculos`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Editar Vínculo' : 'Novo Vínculo'}
          </h1>
          <p className="text-muted-foreground">
            {transportadora?.data?.nome}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Dados do Vínculo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Código de Ocorrência do Sistema */}
            <div className="space-y-2">
              <Label htmlFor="codigo_ocorrencia_codigo">
                Código de Ocorrência (Sistema) <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="codigo_ocorrencia_codigo"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar código de ocorrência..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o código de ocorrência" />
                      </SelectTrigger>
                      <SelectContent>
                        {codigosOcorrencia.map(codigo => (
                          <SelectItem key={codigo.codigo} value={codigo.codigo.toString()}>
                            {codigo.codigo} - {codigo.descricao} ({codigo.tipo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {errors.codigo_ocorrencia_codigo && (
                <p className="text-sm text-red-500">
                  {errors.codigo_ocorrencia_codigo.message}
                </p>
              )}
            </div>

            {/* Código da Transportadora */}
            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código da Transportadora <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                type="number"
                placeholder="Ex: 01, 02, 10..."
                {...register('codigo', { valueAsNumber: true })}
              />
              {errors.codigo && (
                <p className="text-sm text-red-500">{errors.codigo.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Código usado pela transportadora para esta ocorrência
              </p>
            </div>

            {/* Descrição Personalizada */}
            <div className="space-y-2">
              <Label htmlFor="descricao">
                Descrição Personalizada (Opcional)
              </Label>
              <Textarea
                id="descricao"
                placeholder="Descrição customizada para esta ocorrência..."
                rows={4}
                {...register('descricao')}
              />
              {errors.descricao && (
                <p className="text-sm text-red-500">{errors.descricao.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Sobrescreve a descrição padrão do sistema para esta transportadora
              </p>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/transportadoras/${transportadoraId}/vinculos`)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              >
                {(isSubmitting || createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}