// src/components/layout/AdminSettings.jsx
import React from 'react';
import { EnvironmentSwitcher } from '@/components/EnvironmentSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Administrador</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema e alternar entre ambientes
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Configuração de Ambiente</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Admin Only
              </span>
            </CardTitle>
            <CardDescription>
              Alterne entre os ambientes de desenvolvimento e produção para testes e validações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnvironmentSwitcher />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>
              Detalhes da sua conta atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="text-lg">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Função</p>
                <p className="text-lg">{user?.role}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outras Configurações</CardTitle>
            <CardDescription>
              Outras configurações administrativas podem ser adicionadas aqui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta seção pode ser expandida com mais funcionalidades administrativas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}