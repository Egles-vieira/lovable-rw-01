// src/pages/transportadoras/TransportadoraForm.jsx

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useTransportadora,
  useCreateTransportadora,
  useUpdateTransportadora,
} from '@/hooks/useTransportadoras';
import { formatCNPJ } from '@/utils/formatters';
import { validateCNPJ } from '@/utils/validators';

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Schema de validação
const transportadoraSchema = z.object({
  cnpj: z.string()
    .min(14, 'CNPJ deve ter 14 dígitos')
    .refine((val) => validateCNPJ(val), 'CNPJ inválido'),
  nome: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  endereco: z.string()
    .min(5, 'Endereço deve ter no mínimo 5 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres'),
  municipio: z.string()
    .min(2, 'Município deve ter no mínimo 2 caracteres')
    .max(255, 'Município deve ter no máximo 255 caracteres'),
  uf: z.string()
    .length(2, 'UF deve ter 2 caracteres')
    .refine((val) => ESTADOS_BRASIL.includes(val), 'UF inválida'),
  integracao_ocorrencia: z.string().max(255).optional().nullable(),
  romaneio_auto: z.boolean().optional(),
  roterizacao_automatica: z.boolean().optional(),
});

export default function TransportadoraForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: transportadoraData, isLoading: loadingData } = useTransportadora(id);
  const createMutation = useCreateTransportadora();
  const updateMutation = useUpdateTransportadora();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(transportadoraSchema),
    defaultValues: {
      cnpj: '',
      nome: '',
      endereco: '',
      municipio: '',
      uf: '',
      integracao_ocorrencia: '',
      romaneio_auto: false,
      roterizacao_automatica: false,
    }
  });

  const cnpjValue = watch('cnpj');

  // Carregar dados ao editar
  useEffect(() => {
    if (isEdit && transportadoraData?.data) {
      const t = transportadoraData.data;
      setValue('cnpj', t.cnpj);
      setValue('nome', t.nome);
      setValue('endereco', t.endereco);
      setValue('municipio', t.municipio);
      setValue('uf', t.uf);
      setValue('integracao_ocorrencia', t.integracao_ocorrencia || '');
      setValue('romaneio_auto', t.romaneio_auto);
      setValue('roterizacao_automatica', t.roterizacao_automatica);
    }
  }, [isEdit, transportadoraData, setValue]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/transportadoras');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleCnpjChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setValue('cnpj', value);
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
          onClick={() => navigate('/transportadoras')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Editar Transportadora' : 'Nova Transportadora'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Atualize os dados da transportadora' : 'Cadastre uma nova transportadora'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Dados da Transportadora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj">
                CNPJ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formatCNPJ(cnpjValue || '')}
                onChange={handleCnpjChange}
                maxLength={18}
                disabled={isEdit}
              />
              {errors.cnpj && (
                <p className="text-sm text-red-500">{errors.cnpj.message}</p>
              )}
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Nome da transportadora"
                {...register('nome')}
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome.message}</p>
              )}
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="endereco">
                Endereço <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endereco"
                placeholder="Rua, número, complemento"
                {...register('endereco')}
              />
              {errors.endereco && (
                <p className="text-sm text-red-500">{errors.endereco.message}</p>
              )}
            </div>

            {/* Município e UF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipio">
                  Município <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="municipio"
                  placeholder="Cidade"
                  {...register('municipio')}
                />
                {errors.municipio && (
                  <p className="text-sm text-red-500">{errors.municipio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">
                  UF <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="uf"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASIL.map(uf => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.uf && (
                  <p className="text-sm text-red-500">{errors.uf.message}</p>
                )}
              </div>
            </div>

            {/* Integração Ocorrência */}
            <div className="space-y-2">
              <Label htmlFor="integracao_ocorrencia">
                Integração de Ocorrência
              </Label>
              <Input
                id="integracao_ocorrencia"
                placeholder="URL ou chave de integração"
                {...register('integracao_ocorrencia')}
              />
              {errors.integracao_ocorrencia && (
                <p className="text-sm text-red-500">
                  {errors.integracao_ocorrencia.message}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="romaneio_auto"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="romaneio_auto"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="romaneio_auto" className="cursor-pointer">
                  Romaneio Automático
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="roterizacao_automatica"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="roterizacao_automatica"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="roterizacao_automatica" className="cursor-pointer">
                  Roterização Automática
                </Label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/transportadoras')}
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