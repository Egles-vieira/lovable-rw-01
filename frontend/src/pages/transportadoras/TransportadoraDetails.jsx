// src/pages/transportadoras/TransportadoraDetails.jsx

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Building2, MapPin, 
  Phone, Mail, Calendar, CheckCircle, XCircle,
  Link as LinkIcon, Package
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import { useTransportadora, useDeleteTransportadora } from '@/hooks/useTransportadoras';
import { formatCNPJ, formatPhone, formatCEP, formatDate } from '@/utils/formatters';

export default function TransportadoraDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  React.useEffect(() => {
    console.log('=== TransportadoraDetails DEBUG ===');
    console.log('ID capturado da URL:', id);
    console.log('Tipo do ID:', typeof id);
    console.log('URL completa:', window.location.pathname);
    console.log('==================================');
  }, [id]);
  const { data, isLoading, error } = useTransportadora(id);
  const deleteTransportadora = useDeleteTransportadora();

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir a transportadora "${data?.data?.nome}"?`)) {
      try {
        await deleteTransportadora.mutateAsync(id);
        toast({
          title: "Transportadora excluída",
          description: "A transportadora foi removida com sucesso.",
        });
        navigate('/transportadoras');
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Erro ao carregar transportadora: {error.message}
            </p>
            <Button onClick={() => navigate('/transportadoras')} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transportadora = data?.data;

  if (!transportadora) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Transportadora não encontrada</p>
            <Button onClick={() => navigate('/transportadoras')} className="mt-4">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/transportadoras')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {transportadora.nome}
            </h1>
            <p className="text-muted-foreground mt-1">
              {formatCNPJ(transportadora.cnpj)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
<Button
  variant="outline"
  onClick={() => {
    console.log('Navegando para vínculos com ID:', id);
    navigate(`/transportadoras/${id}/vinculos`);
  }}
>
  <Package className="h-4 w-4 mr-2" />
  Vínculos
</Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/transportadoras/${id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dados Cadastrais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados Cadastrais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">CNPJ</p>
              <p className="font-medium">{formatCNPJ(transportadora.cnpj)}</p>
            </div>
          <Separator className="my-2" decorative="true" />
            <div>
              <p className="text-sm text-muted-foreground">Razão Social</p>
              <p className="font-medium">{transportadora.nome}</p>
            </div>
            {transportadora.inscricao_estadual && (
              <>
             <Separator className="my-2" decorative="true" />
                <div>
                  <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
                  <p className="font-medium">{transportadora.inscricao_estadual}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transportadora.endereco && (
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{transportadora.endereco}</p>
              </div>
            )}
            {transportadora.bairro && (
              <>
               <Separator className="my-2" decorative="true" />
                <div>
                  <p className="text-sm text-muted-foreground">Bairro</p>
                  <p className="font-medium">{transportadora.bairro}</p>
                </div>
              </>
            )}
          <Separator className="my-2" decorative="true" />
            <div>
              <p className="text-sm text-muted-foreground">Cidade/UF</p>
              <p className="font-medium">
                {transportadora.municipio}/{transportadora.uf}
              </p>
            </div>
            {transportadora.cep && (
              <>
        <Separator className="my-2" decorative="true" />
                <div>
                  <p className="text-sm text-muted-foreground">CEP</p>
                  <p className="font-medium">{formatCEP(transportadora.cep)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contato e Integração */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato & Integração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transportadora.telefone && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefone
                </p>
                <p className="font-medium">{formatPhone(transportadora.telefone)}</p>
              </div>
            )}
            {transportadora.email && (
              <>
              <Separator className="my-2" decorative="true" />
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="font-medium">{transportadora.email}</p>
                </div>
              </>
            )}
       <Separator className="my-2" decorative="true" />
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                Integração
              </p>
              {transportadora.integracao_ocorrencia ? (
                <Badge variant="success" className="mt-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {transportadora.integracao_ocorrencia.toUpperCase()}
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-2">
                  <XCircle className="h-3 w-3 mr-1" />
                  Sem integração
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Data de Cadastro</p>
              <p className="font-medium">
                {transportadora.created_at ? formatDate(transportadora.created_at) : 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="font-medium">
                {transportadora.updated_at ? formatDate(transportadora.updated_at) : 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID do Sistema</p>
              <p className="font-medium font-mono text-sm">{transportadora.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/transportadoras/${id}/vinculos`)}
            >
              <Package className="h-4 w-4 mr-2" />
              Gerenciar Vínculos
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/transportadoras/${id}/editar`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Dados
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({ title: "Em desenvolvimento", description: "Histórico em breve!" })}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ver Histórico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}