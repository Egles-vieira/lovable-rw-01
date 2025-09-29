// src/pages/admin/TempMessagingPage.jsx - Versão temporária para teste
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Bell, Webhook } from 'lucide-react';

const TempMessagingPage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações de Mensageria</h1>
        <p className="text-gray-600 mt-2">
          Sistema de configuração de mensageria em desenvolvimento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>E-mail</CardTitle>
                <CardDescription>
                  Envio de e-mails transacionais e marketing
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure provedores como SMTP, Gmail, SendGrid, etc.
            </p>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Sistema em desenvolvimento. Em breve disponível!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>SMS</CardTitle>
                <CardDescription>
                  Envio de mensagens SMS
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Integração com provedores SMS para notificações.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                🔄 Próxima atualização
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Notificações push para apps
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Notificações push para aplicativos móveis e web.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                🔄 Próxima atualização
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Webhook className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>
                  Integração com sistemas externos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Webhooks para notificar sistemas externos.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                🔄 Próxima atualização
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TempMessagingPage;