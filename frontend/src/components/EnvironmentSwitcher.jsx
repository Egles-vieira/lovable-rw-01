// src/components/EnvironmentSwitcher.jsx - VERSÃO ATUALIZADA
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnvironment } from '@/contexts/EnvironmentContext'; // ← NOVO IMPORT
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Server, Laptop, RefreshCw } from 'lucide-react';

export function EnvironmentSwitcher() {
  const { user } = useAuth();
  const { environment, apiUrl, isProduction, setEnvironment } = useEnvironment(); // ← USANDO CONTEXT
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleEnvironmentChange = async (newIsProduction) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const newEnv = newIsProduction ? 'production' : 'development';
      
      // Usar o context para alterar o ambiente
      setEnvironment(newEnv);
      
      // Preparar recarregamento
      setIsRefreshing(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao alterar ambiente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnvironmentInfo = () => {
    return {
      name: isProduction ? 'Produção' : 'Desenvolvimento',
      icon: isProduction ? Server : Laptop,
      color: isProduction ? 'text-red-600' : 'text-green-600',
      description: isProduction ? 
        'Conectado ao servidor de produção' : 
        'Conectado ao servidor local'
    };
  };

  const envInfo = getEnvironmentInfo();
  const EnvIcon = envInfo.icon;

  // Verificar permissões
  if (!user || user.role !== 'admin') {
    return (
      <Card className="w-full max-w-md opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Server className="h-5 w-5" />
            Configuração de Ambiente
          </CardTitle>
          <CardDescription>
            Acesso restrito a administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Você não tem permissão para alterar as configurações de ambiente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Configuração de Ambiente
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
            Admin
          </span>
        </CardTitle>
        <CardDescription>
          Alterne entre os ambientes de desenvolvimento e produção
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status atual */}
        <Alert className={isProduction ? 'border-red-200' : 'border-green-200'}>
          <EnvIcon className={`h-4 w-4 ${envInfo.color}`} />
          <AlertDescription>
            <strong>Ambiente atual:</strong> {envInfo.name}
            <br />
            <strong>URL da API:</strong> {apiUrl}
          </AlertDescription>
        </Alert>

        {/* Switch de ambiente */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Laptop className="h-5 w-5 text-green-600" />
            <div>
              <Label htmlFor="environment-mode" className="font-medium">
                Desenvolvimento
              </Label>
              <p className="text-sm text-muted-foreground">Localhost</p>
            </div>
          </div>
          
          <Switch
            id="environment-mode"
            checked={isProduction}
            onCheckedChange={handleEnvironmentChange}
            disabled={isLoading}
          />
          
          <div className="flex items-center space-x-3">
            <Server className="h-5 w-5 text-red-600" />
            <div>
              <Label htmlFor="environment-mode" className="font-medium">
                Produção
              </Label>
              <p className="text-sm text-muted-foreground">Servidor remoto</p>
            </div>
          </div>
        </div>

        {/* Avisos */}
        {isProduction && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>⚠️ Modo produção:</strong> Alterações afetarão dados reais.
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de ação */}
        <Button 
          onClick={() => handleEnvironmentChange(!isProduction)}
          disabled={isLoading}
          variant={isProduction ? "destructive" : "default"}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Alterando...
            </>
          ) : isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Recarregando...
            </>
          ) : (
            `Mudar para ${isProduction ? 'Desenvolvimento' : 'Produção'}`
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          A aplicação será recarregada automaticamente.
        </div>
      </CardContent>
    </Card>
  );
}