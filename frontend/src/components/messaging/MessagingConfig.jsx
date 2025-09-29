// src/components/messaging/MessagingConfig.jsx
import React, { useState, useEffect } from 'react';
import { useMessagingConfig } from '@/hooks/useEmail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Webhook, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Info,
  TrendingUp,
  Users,
  Send,
  Clock,
  BarChart3
} from 'lucide-react';
import EmailSettings from '@/components/email/EmailSettings';

const MessagingConfig = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    globalConfig,
    loadAllConfigurations,
    getGlobalStatus,
    hasAnyService,
    email
  } = useMessagingConfig();

  const [status, setStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações na inicialização
  useEffect(() => {
    const loadConfigs = async () => {
      setIsLoading(true);
      await loadAllConfigurations();
      setStatus(getGlobalStatus());
      setIsLoading(false);
    };

    loadConfigs();
  }, [loadAllConfigurations, getGlobalStatus]);

  // Atualizar status quando houver mudanças
  useEffect(() => {
    setStatus(getGlobalStatus());
  }, [getGlobalStatus, globalConfig]);

  // Configurações dos serviços
  const services = [
    {
      key: 'email',
      name: 'E-mail',
      icon: Mail,
      description: 'Envio de e-mails transacionais e marketing',
      color: 'blue',
      status: status.email?.configured || false,
      provider: status.email?.provider || null,
      lastTest: status.email?.lastTest || null
    },
    {
      key: 'sms',
      name: 'SMS',
      icon: MessageSquare,
      description: 'Envio de mensagens SMS',
      color: 'green',
      status: status.sms?.configured || false,
      provider: status.sms?.provider || null,
      disabled: true // Temporariamente desabilitado
    },
    {
      key: 'push',
      name: 'Push Notifications',
      icon: Bell,
      description: 'Notificações push para aplicativos',
      color: 'purple',
      status: status.push?.configured || false,
      provider: status.push?.provider || null,
      disabled: true // Temporariamente desabilitado
    },
    {
      key: 'webhook',
      name: 'Webhooks',
      icon: Webhook,
      description: 'Notificações via webhook para sistemas externos',
      color: 'orange',
      status: status.webhook?.configured || false,
      provider: status.webhook?.provider || null,
      disabled: true // Temporariamente desabilitado
    }
  ];

  // Calcular progresso geral
  const getOverallProgress = () => {
    const totalServices = services.length;
    const configuredServices = services.filter(service => service.status).length;
    return (configuredServices / totalServices) * 100;
  };

  // Obter cor do badge baseada no status
  const getStatusBadge = (configured, lastTest = null) => {
    if (!configured) {
      return <Badge variant="secondary">Não configurado</Badge>;
    }
    
    if (lastTest) {
      return lastTest.success 
        ? <Badge variant="default" className="bg-green-600">Funcionando</Badge>
        : <Badge variant="destructive">Erro no teste</Badge>;
    }
    
    return <Badge variant="default">Configurado</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configurações de Mensageria</h1>
        <p className="text-gray-600 mt-2">
          Configure todos os serviços de comunicação da plataforma
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="sms" disabled>SMS</TabsTrigger>
          <TabsTrigger value="push" disabled>Push</TabsTrigger>
          <TabsTrigger value="webhook" disabled>Webhooks</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Status Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Status Geral</span>
              </CardTitle>
              <CardDescription>
                Progresso da configuração dos serviços de mensageria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Serviços configurados</span>
                    <span>{services.filter(s => s.status).length} de {services.length}</span>
                  </div>
                  <Progress value={getOverallProgress()} className="h-2" />
                </div>

                {!hasAnyService() && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum serviço de mensageria está configurado. Configure pelo menos um serviço para começar a enviar mensagens.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cards dos Serviços */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => {
              const IconComponent = service.icon;
              
              return (
                <Card 
                  key={service.key} 
                  className={`${service.disabled ? 'opacity-60' : 'hover:shadow-lg'} transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${service.color}-100`}>
                          <IconComponent className={`h-5 w-5 text-${service.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(service.status, service.lastTest)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {service.status && service.provider && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Provedor:</span> {service.provider}
                        </div>
                      )}

                      {service.lastTest && (
                        <div className="text-sm">
                          <span className="font-medium">Último teste:</span>
                          <span className={`ml-2 ${service.lastTest.success ? 'text-green-600' : 'text-red-600'}`}>
                            {service.lastTest.success ? 'Sucesso' : 'Falha'}
                          </span>
                        </div>
                      )}

                      <Button 
                        variant={service.status ? 'outline' : 'default'}
                        className="w-full"
                        disabled={service.disabled}
                        onClick={() => setActiveTab(service.key)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        {service.status ? 'Gerenciar' : 'Configurar'}
                      </Button>

                      {service.disabled && (
                        <p className="text-xs text-gray-500 text-center">
                          Em desenvolvimento
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-xs text-gray-600">Mensagens enviadas hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">--%</p>
                    <p className="text-xs text-gray-600">Taxa de entrega</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-xs text-gray-600">Mensagens na fila</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuração de E-mail */}
        <TabsContent value="email">
          <EmailSettings />
        </TabsContent>

        {/* Configuração de SMS */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Configuração SMS</span>
              </CardTitle>
              <CardDescription>
                Configure provedores SMS para envio de mensagens de texto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  A configuração de SMS estará disponível em breve. 
                  Aguarde as próximas atualizações da plataforma.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuração de Push */}
        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Push Notifications</span>
              </CardTitle>
              <CardDescription>
                Configure notificações push para aplicativos móveis e web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  As notificações push estarão disponíveis em breve. 
                  Aguarde as próximas atualizações da plataforma.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuração de Webhooks */}
        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="h-5 w-5" />
                <span>Webhooks</span>
              </CardTitle>
              <CardDescription>
                Configure webhooks para integração com sistemas externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  A configuração de webhooks estará disponível em breve. 
                  Aguarde as próximas atualizações da plataforma.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingConfig;