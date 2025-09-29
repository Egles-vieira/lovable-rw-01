// src/pages/transportadoras/TransportadoraCreate.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import { useCreateTransportadora } from '@/hooks/useTransportadoras';
import { formatCNPJ, formatPhone, formatCEP } from '@/utils/formatters';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const INTEGRACOES = [
  { value: 'jamef', label: 'Jamef' },
  { value: 'braspress', label: 'Braspress' },
  { value: 'tnt', label: 'TNT' },
  { value: 'correios', label: 'Correios' },
  { value: 'none', label: 'Sem integração' }  // ✅ CORRETO!
];

export default function TransportadoraCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createTransportadora = useCreateTransportadora();

  const [formData, setFormData] = useState({
    cnpj: '',
    nome: '',
    endereco: '',
    municipio: '',
    uf: '',
    cep: '',
    telefone: '',
    email: '',
    integracao_ocorrencia: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cnpj) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }

    if (!formData.nome || formData.nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.municipio) {
      newErrors.municipio = 'Município é obrigatório';
    }

    if (!formData.uf) {
      newErrors.uf = 'UF é obrigatório';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
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
      const dataToSend = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        cep: formData.cep.replace(/\D/g, '')
      };

      await createTransportadora.mutateAsync(dataToSend);
      
      toast({
        title: "Transportadora criada",
        description: `${formData.nome} foi cadastrada com sucesso!`,
      });

      navigate('/transportadoras');
    } catch (error) {
      toast({
        title: "Erro ao criar transportadora",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/transportadoras')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Transportadora</h1>
          <p className="text-muted-foreground mt-1">
            Cadastre uma nova transportadora no sistema
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Transportadora
            </CardTitle>
            <CardDescription>
              Preencha os dados cadastrais da transportadora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CNPJ e Nome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">
                  CNPJ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formatCNPJ(formData.cnpj)}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className={errors.cnpj ? 'border-red-500' : ''}
                  maxLength={18}
                />
                {errors.cnpj && (
                  <p className="text-sm text-red-500">{errors.cnpj}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome"
                  placeholder="Nome da transportadora"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome}</p>
                )}
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                placeholder="Rua, número, complemento"
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
              />
            </div>

            {/* Município, UF e CEP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipio">
                  Município <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="municipio"
                  placeholder="Cidade"
                  value={formData.municipio}
                  onChange={(e) => handleChange('municipio', e.target.value)}
                  className={errors.municipio ? 'border-red-500' : ''}
                />
                {errors.municipio && (
                  <p className="text-sm text-red-500">{errors.municipio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">
                  UF <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.uf}
                  onValueChange={(value) => handleChange('uf', value)}
                >
                  <SelectTrigger className={errors.uf ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.uf && (
                  <p className="text-sm text-red-500">{errors.uf}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={formatCEP(formData.cep)}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  maxLength={9}
                />
              </div>
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={formatPhone(formData.telefone)}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@transportadora.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Integração */}
            <div className="space-y-2">
              <Label htmlFor="integracao">Integração de Ocorrências</Label>
           <Select
                           value={formData.integracao_ocorrencia || 'none'}
                           onValueChange={(value) => 
                               handleChange('integracao_ocorrencia', value === 'none' ? '' : value)
                           }
                           >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma integração" />
                </SelectTrigger>
                <SelectContent>
                  {INTEGRACOES.map(int => (
                    <SelectItem key={int.value} value={int.value}>
                      {int.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Define qual API será utilizada para integração de ocorrências
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/transportadoras')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createTransportadora.isLoading}>
            {createTransportadora.isLoading ? (
              <>Salvando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}