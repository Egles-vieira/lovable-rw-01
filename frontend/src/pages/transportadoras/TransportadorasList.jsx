// src/pages/transportadoras/TransportadorasList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, Upload, 
  Eye, Edit, Trash2, Building2, MapPin, 
  Phone, Mail, CheckCircle, XCircle 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import { useTransportadoras, useDeleteTransportadora } from '@/hooks/useTransportadoras';
import { formatCNPJ, formatPhone } from '@/utils/formatters';

export default function TransportadorasList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    uf: '',
    integracaoOcorrencia: ''
  });

  // Queries
  const { data, isLoading, error, refetch } = useTransportadoras({
    page,
    limit,
    search,
    ...filters
  });

  const deleteTransportadora = useDeleteTransportadora();

  // 🔍 DEBUG: Verificar estrutura dos dados da API
  useEffect(() => {
    if (data?.data) {
      console.log('=== DEBUG TransportadorasList ===');
      console.log('Total de transportadoras:', data.data.length);
      console.log('Primeira transportadora completa:', data.data[0]);
      
      // Mapear IDs para debug
      const idsInfo = data.data.map(t => ({
        nome: t.nome,
        id: t.id,
        tipo_id: typeof t.id,
        tem_id: !!t.id
      }));
      console.log('IDs das transportadoras:', idsInfo);
      
      // Alertar sobre transportadoras sem ID
      const semId = data.data.filter(t => !t.id);
      if (semId.length > 0) {
        console.error('⚠️ ATENÇÃO: Transportadoras SEM ID:', semId);
        toast({
          title: "Aviso: Dados Incompletos",
          description: `${semId.length} transportadora(s) sem ID válido`,
          variant: "destructive",
        });
      }
      console.log('================================');
    }
  }, [data, toast]);

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleDelete = async (id, nome) => {
    if (!id) {
      toast({
        title: "Erro",
        description: "ID da transportadora não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a transportadora "${nome}"?`)) {
      try {
        await deleteTransportadora.mutateAsync(id);
        toast({
          title: "Transportadora excluída",
          description: `${nome} foi removida com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

const handleNavigate = (path, transportadora) => {
  if (!transportadora.id) {
    console.error('Tentativa de navegação com ID inválido:', transportadora);
    toast({
      title: "Erro de navegação",
      description: "Esta transportadora não possui ID válido",
      variant: "destructive",
    });
    return;
  }
  
  // Garantir que o path seja construído corretamente
  const correctPath = path.replace('${transportadora.id}', transportadora.id);
  console.log(`Navegando para: ${correctPath} | Transportadora ID: ${transportadora.id}`);
  navigate(correctPath);

    console.log(`Navegando para: ${path} | Transportadora ID: ${transportadora.id}`);
    navigate(path);
  };

  const handleExport = () => {
    toast({
      title: "Exportando dados",
      description: "O arquivo será baixado em instantes...",
    });
    // TODO: Implementar exportação
  };

  const handleImport = () => {
    toast({
      title: "Importação",
      description: "Funcionalidade em desenvolvimento...",
    });
    // TODO: Implementar importação
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Erro ao carregar transportadoras: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transportadoras = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transportadoras</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as transportadoras cadastradas no sistema
          </p>
        </div>
        <Button onClick={() => navigate('/transportadoras/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transportadora
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CNPJ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Filtrar por:</p>
                  <Input
                    placeholder="UF"
                    value={filters.uf}
                    onChange={(e) => setFilters({ ...filters, uf: e.target.value })}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Integração"
                    value={filters.integracaoOcorrencia}
                    onChange={(e) => setFilters({ ...filters, integracaoOcorrencia: e.target.value })}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button type="submit">Buscar</Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Ações</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </form>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>
            {pagination.total || 0} transportadora(s) encontrada(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Integração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportadoras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma transportadora encontrada
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                transportadoras.map((transportadora) => (
                  <TableRow key={transportadora.id || Math.random()}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {transportadora.nome}
                        {!transportadora.id && (
                          <Badge variant="destructive" className="ml-2">SEM ID</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCNPJ(transportadora.cnpj)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {transportadora.municipio}/{transportadora.uf}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {transportadora.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {formatPhone(transportadora.telefone)}
                          </div>
                        )}
                        {transportadora.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {transportadora.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transportadora.integracao_ocorrencia ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {transportadora.integracao_ocorrencia}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Sem integração
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Ações
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleNavigate(
                              `/transportadoras/${transportadora.id}`,
                              transportadora
                            )}
                            disabled={!transportadora.id}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleNavigate(
                              `/transportadoras/${transportadora.id}/editar`,
                              transportadora
                            )}
                            disabled={!transportadora.id}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        <DropdownMenuItem 
                        onClick={() => handleNavigate(
                          `/transportadoras/${transportadora.id}/vinculos`,
                          transportadora
                        )}
                        disabled={!transportadora.id}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Vínculos
                      </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(transportadora.id, transportadora.nome)}
                            className="text-red-600"
                            disabled={!transportadora.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {pagination.currentPage} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}