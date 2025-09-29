// src/pages/transportadoras/vinculos/VinculoCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

import { useCreateTransportadoraCodigo } from '@/hooks/useTransportadoraCodigo';
import { useTransportadora } from '@/hooks/useTransportadoras';

export default function VinculoCreate() {
  const navigate = useNavigate();
  const params = useParams();
  const { toast } = useToast();

  // Extrair e validar o ID - tratar string 'undefined'
  const transportadoraId = params.id === 'undefined' ? null : params.id;

  // Debug
  useEffect(() => {
    console.log('=== DEBUG VinculoCreate ===');
    console.log('Params:', params);
    console.log('Transportadora ID:', transportadoraId);
    console.log('Tipo do ID:', typeof transportadoraId);
    console.log('========================');
  }, [params, transportadoraId]);

  // Redirecionar se ID for inválido
  useEffect(() => {
    if (!transportadoraId) {
      console.error('ID da transportadora inválido ou undefined');
      
      toast({
        title: "Erro de navegação",
        description: "Transportadora não encontrada. Redirecionando...",
        variant: "destructive",
      });
      
      // Redirecionar após breve delay
      const timer = setTimeout(() => {
        navigate('/transportadoras', { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [transportadoraId, navigate, toast]);

  const { data: transportadoraData, isLoading: loadingTransportadora, error: errorTransportadora } = useTransportadora(transportadoraId);
  const createVinculo = useCreateTransportadoraCodigo();

  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    codigo_ocorrencia_codigo: ''
  });

  const [errors, setErrors] = useState({});

  // Se ID for inválido, mostrar mensagem de erro
  if (!transportadoraId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> ID da transportadora não encontrado.
            <br />
            Redirecionando para lista de transportadoras...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Restante do código permanece igual...
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
      await createVinculo.mutateAsync({
        transportadoraId: parseInt(transportadoraId),
        data: {
          codigo: formData.codigo.trim(),
          descricao: formData.descricao.trim(),
          codigo_ocorrencia_codigo: parseInt(formData.codigo_ocorrencia_codigo)
        }
      });
      
      toast({
        title: "Vínculo criado com sucesso!",
        description: `O código ${formData.codigo} foi vinculado ao sistema.`,
      });

      navigate(`/transportadoras/${transportadoraId}/vinculos`);
    } catch (error) {
      console.error('Erro ao criar vínculo:', error);
      toast({
        title: "Erro ao criar vínculo",
        description: error.response?.data?.message || error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    }
  };

  // Mostrar erro da API
  if (errorTransportadora) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro ao carregar transportadora:</strong> {errorTransportadora.message}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/transportadoras')} 
          className="mt-4"
        >
          Voltar para Transportadoras
        </Button>
      </div>
    );
  }

  const transportadora = transportadoraData?.data;

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
          <h1 className="text-3xl font-bold tracking-tight">Novo Vínculo</h1>
          <p className="text-muted-foreground mt-1">
            {loadingTransportadora ? (
              'Carregando...'
            ) : (
              `Vincular código da ${transportadora?.nome || 'transportadora'} com código interno do sistema`
            )}
          </p>
        </div>
      </div>

      {/* Restante do formulário... */}
      <form onSubmit={handleSubmit}>
        {/* ... código do formulário permanece igual */}
      </form>
    </div>
  );
}