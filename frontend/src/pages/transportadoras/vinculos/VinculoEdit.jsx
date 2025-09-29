// src/pages/transportadoras/vinculos/VinculoEdit.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

import { 
  useTransportadoraCodigo, 
  useUpdateTransportadoraCodigo 
} from '@/hooks/useTransportadoraCodigo';
import { useTransportadora } from '@/hooks/useTransportadoras';
import { formatDate } from '@/utils/formatters';

export default function VinculoEdit() {
  const navigate = useNavigate();
  const { id: transportadoraId, vinculoId } = useParams();
  const { toast } = useToast();

  const { data: transportadoraData } = useTransportadora(transportadoraId);
  const { data: vinculoData, isLoading, error } = useTransportadoraCodigo(vinculoId);
  const updateVinculo = useUpdateTransportadoraCodigo();

  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    codigo_ocorrencia_codigo: ''
  });

  const [errors, setErrors] = useState({});

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (vinculoData?.data) {
      const vinculo = vinculoData.data;
      setFormData({
        codigo: vinculo.codigo?.toString() || '',
        descricao: vinculo.descricao || '',
        codigo_ocorrencia_codigo: vinculo.codigo_ocorrencia_codigo?.toString() || ''
      });
    }
  }, [vinculoData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigo || formData.codigo.trim() === '') {
      newErrors.codigo = 'Código da transportadora é obrigatório';
    }

    if (!formData.descricao || formData.descricao.trim().length < 3) {
      newErrors.descricao = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!formData.codigo_ocorrencia_codigo || formData.codigo_ocorrencia_codigo.trim() === '') {
      newErrors.codigo_ocorrencia_codigo = 'Código interno do sistema é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateVinculo.mutateAsync({
        id: vinculoId,
        data: {
          codigo: formData.codigo.trim(),
          descricao: formData.descricao.trim(),
          codigo_ocorrencia_codigo: parseInt(formData.codigo_ocorrencia_codigo),
          transportadora_id: parseInt(transportadoraId)
        }
      });
      
      toast({
        title: "Vínculo atualizado!",
        description: `O vínculo do código ${formData.codigo} foi atualizado com sucesso.`,
      });

      navigate(`/transportadoras/${transportadoraId}/vinculos`);
    } catch (error) {
      toast({
        title: "Erro ao atualizar vínculo",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const transportadora = transportadoraData?.data;
  const vinculo = vinculoData?.data;

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">
              Erro ao carregar vínculo: {error.message}
            </p>
            <Button 
              onClick={() => navigate(`/transportadoras/${transportadoraId}/vinculos`)} 
              className="mt-4"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/transportadoras/${transportadoraId}/vinculos`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Vínculo</h1>
          <p className="text-muted-foreground mt-1">
            Atualizar mapeamento de código - {transportadora?.nome || 'Transportadora'}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Dados do Vínculo
            </CardTitle>
            <CardDescription>
              Atualize o mapeamento entre código da transportadora e código interno
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Código da Transportadora */}
            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código da Transportadora <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                placeholder="Ex: 01, 02, 100, ENT-01"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value)}
                className={errors.codigo ? 'border-red-500' : ''}
              />
              {errors.codigo && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.codigo}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Código usado pela transportadora para identificar a ocorrência
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">
                Descrição da Ocorrência <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descricao"
                placeholder="Ex: Entrega realizada, Nota fiscal em trânsito"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                className={errors.descricao ? 'border-red-500' : ''}
                rows={4}
              />
              {errors.descricao && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.descricao}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Descrição da ocorrência conforme nomenclatura da transportadora
              </p>
            </div>

            {/* Código Interno (Sistema) */}
            <div className="space-y-2">
              <Label htmlFor="codigo_ocorrencia">
                Código Interno do Sistema <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo_ocorrencia"
                type="number"
                placeholder="Ex: 1, 2, 10"
                value={formData.codigo_ocorrencia_codigo}
                onChange={(e) => handleChange('codigo_ocorrencia_codigo', e.target.value)}
                className={errors.codigo_ocorrencia_codigo ? 'border-red-500' : ''}
              />
              {errors.codigo_ocorrencia_codigo && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.codigo_ocorrencia_codigo}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Código padronizado do sistema (tabela: codigo_ocorrencias)
              </p>
            </div>

            {/* Info do Vínculo Atual */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Informações do Vínculo:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID:</span>{' '}
                    <span className="font-mono">{vinculoId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transportadora:</span>{' '}
                    <strong>{transportadora?.nome}</strong>
                  </div>
                  {vinculo?.created_at && (
                    <div>
                      <span className="text-muted-foreground">Criado em:</span>{' '}
                      {formatDate(vinculo.created_at)}
                    </div>
                  )}
                  {vinculo?.updated_at && (
                    <div>
                      <span className="text-muted-foreground">Atualizado em:</span>{' '}
                      {formatDate(vinculo.updated_at)}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/transportadoras/${transportadoraId}/vinculos`)}
            disabled={updateVinculo.isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={updateVinculo.isLoading}>
            {updateVinculo.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}