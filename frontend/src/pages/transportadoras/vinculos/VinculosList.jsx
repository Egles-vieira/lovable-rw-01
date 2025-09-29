// src/pages/transportadoras/vinculos/VinculosList.jsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, ArrowLeft, Edit, Trash2, FileDown, 
  FileUp, MoreVertical, Search 
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
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useCodigosByTransportadora,
  useDeleteTransportadoraCodigo,
  useExportVinculos 
} from '@/hooks/useTransportadoraCodigo';
import { useTransportadora } from '@/hooks/useTransportadoras';
import { Pagination } from '@/components/ui/pagination';

export default function VinculosList() {
  const { transportadoraId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Queries
  const { data: transportadora } = useTransportadora(transportadoraId);
  const { data, isLoading, error } = useCodigosByTransportadora(transportadoraId, {
    page,
    limit
  });

  const deleteVinculo = useDeleteTransportadoraCodigo();
  const exportVinculos = useExportVinculos();

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este vínculo?')) {
      deleteVinculo.mutate(id);
    }
  };

  const handleExport = () => {
    exportVinculos.mutate({ 
      transportadora_id: transportadoraId,
      format: 'csv' 
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Erro ao carregar vínculos: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/transportadoras/${transportadoraId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Códigos de Ocorrência</h1>
            <p className="text-muted-foreground">
              {transportadora?.data?.nome}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportVinculos.isPending}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/transportadoras/${transportadoraId}/vinculos/importar`)}
          >
            <FileUp className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => navigate(`/transportadoras/${transportadoraId}/vinculos/novo`)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Vínculo
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código da Transportadora</TableHead>
                <TableHead>Código Sistema</TableHead>
                <TableHead>Descrição Ocorrência</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição Personalizada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhum vínculo encontrado
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((vinculo) => (
                  <TableRow key={vinculo.id}>
                    <TableCell>
                      <Badge variant="outline">{vinculo.codigo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{vinculo.codigo_ocorrencia_codigo}</Badge>
                    </TableCell>
                    <TableCell>{vinculo.ocorrencia_descricao}</TableCell>
                    <TableCell>
                      <Badge variant={
                        vinculo.ocorrencia_finalizadora ? "destructive" : 
                        vinculo.ocorrencia_processo ? "default" : "secondary"
                      }>
                        {vinculo.ocorrencia_tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {vinculo.descricao || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => navigate(
                              `/transportadoras/${transportadoraId}/vinculos/${vinculo.id}/editar`
                            )}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(vinculo.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data?.pagination && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}