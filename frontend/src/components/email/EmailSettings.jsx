// src/components/email/EmailSettings.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEmailConfig } from '@/hooks/useEmail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Mail, 
  Settings, 
  TestTube, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw
} from 'lucide-react';

const EmailSettings = () => {
  const [selectedProvider, setSelectedProvider] = useState('smtp');
  const [showSensitiveFields, setShowSensitiveFields] = useState({});
  const [testEmail, setTestEmail] = useState('');
  
  const {
    currentProvider,
    currentConfig,
    isLoading,
    isSaving,
    isTesting,
    error,
    success,
    lastTestResult,
    getProviders,
    getProviderConfig,
    saveConfiguration,
    testConfiguration,
    loadConfig,
    clearConfig,
    clearMessages
  } = useEmailConfig();

  const providers = getProviders();
  const providerConfig = getProviderConfig(selectedProvider);

  // Criar schema de validação dinâmico
  const createValidationSchema = (provider) => {
    const config = getProviderConfig(provider);
    if (!config) return z.object({});

    const schemaFields = {};
    
    config.fields.forEach(field => {
      let validator = z.string();
      
      if (!field.required) {
        validator = validator.optional().or(z.literal(''));
      } else {
        validator = validator.min(1, `${field.label} é obrigatório`);
      }

      // Validações específicas
      switch (field.type) {
        case 'email':
          validator = validator.email(`${field.label} deve ser um e-mail válido`);
          break;
        case 'number':
          validator = z.number({ invalid_type_error: `${field.label} deve ser um número` });
          if (!field.required) {
            validator = validator.optional();
          }
          break;
        case 'boolean':
          validator = z.boolean();
          if (!field.required) {
            validator = validator.optional();
          }
          break;
      }

      schemaFields[field.key] = validator;
    });

    return z.object(schemaFields);
  };

  const validationSchema = createValidationSchema(selectedProvider);

  // Configurar form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {}
  });

  const watchedFields = watch();

  // Carregar configuração atual quando o provedor muda
  useEffect(() => {
    if (selectedProvider === currentProvider && currentConfig) {
      // Resetar form com a configuração atual
      reset(currentConfig);
    } else {
      // Resetar form com valores padrão
      const defaultValues = {};
      providerConfig?.fields.forEach(field => {
        defaultValues[field.key] = field.default || '';
      });
      reset(defaultValues);
    }
  }, [selectedProvider, currentProvider, currentConfig, reset, providerConfig]);

  // Carregar configuração do servidor na inicialização
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Função para salvar configuração
  const onSubmit = async (data) => {
    // Converter strings vazias para null nos campos opcionais
    const cleanData = {};
    Object.keys(data).forEach(key => {
      if (data[key] === '' && !providerConfig?.fields.find(f => f.key === key)?.required) {
        cleanData[key] = null;
      } else {
        cleanData[key] = data[key];
      }
    });

    await saveConfiguration(selectedProvider, cleanData);
  };

  // Função para testar configuração
  const handleTest = async () => {
    if (!testEmail) {
      alert('Digite um e-mail para teste');
      return;
    }

    const configToTest = selectedProvider === currentProvider ? currentConfig : watchedFields;
    await testConfiguration(selectedProvider, configToTest);
  };

  // Toggle para mostrar/ocultar campos sensíveis
  const toggleSensitiveField = (fieldKey) => {
    setShowSensitiveFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // Renderizar campo baseado no tipo
  const renderField = (field) => {
    const isSensitive = ['password', 'api_key', 'client_secret', 'secret_access_key', 'refresh_token'].includes(field.key);
    const showField = !isSensitive || showSensitiveFields[field.key];

    switch (field.type) {
      case 'boolean':
        return (
          <div key={field.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label htmlFor={field.key} className="text-sm font-medium">
              {field.label}
            </Label>
            <Switch
              id={field.key}
              checked={watchedFields[field.key] || false}
              onCheckedChange={(checked) => setValue(field.key, checked)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label} {field.required && '*'}
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {watchedFields[field.key] 
                    ? field.options?.find(opt => opt.value === watchedFields[field.key])?.label || watchedFields[field.key]
                    : field.placeholder || 'Selecionar'
                  }
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {field.options?.map(option => (
                  <DropdownMenuItem 
                    key={option.value}
                    onSelect={() => setValue(field.key, option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {errors[field.key] && (
              <p className="text-sm text-red-500">{errors[field.key].message}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label} {field.required && '*'}
            </Label>
            <div className="relative">
              <Input
                id={field.key}
                type={showField ? (field.type === 'number' ? 'number' : 'text') : 'password'}
                placeholder={field.placeholder}
                disabled={isLoading}
                {...register(field.key, { 
                  valueAsNumber: field.type === 'number' 
                })}
              />
              {isSensitive && (
                <button
                  type="button"
                  onClick={() => toggleSensitiveField(field.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showField ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
            {errors[field.key] && (
              <p className="text-sm text-red-500">{errors[field.key].message}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações de E-mail</h2>
          <p className="text-gray-600">Configure os provedores de e-mail para envio de mensagens</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={currentProvider && Object.keys(currentConfig).length > 0 ? 'default' : 'secondary'}>
            {currentProvider && Object.keys(currentConfig).length > 0 ? 'Configurado' : 'Não configurado'}
          </Badge>
        </div>
      </div>

      {/* Seletor de Provedor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Provedor de E-mail</span>
          </CardTitle>
          <CardDescription>
            Selecione o provedor de e-mail que deseja configurar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(providers).map(([key, provider]) => (
              <div
                key={key}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProvider === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedProvider(key);
                  clearMessages();
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-gray-500">{provider.description}</p>
                  </div>
                </div>
                {currentProvider === key && Object.keys(currentConfig).length > 0 && (
                  <Badge className="mt-2" variant="default" size="sm">Ativo</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuração do Provedor */}
      {providerConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configurar {providerConfig.name}</span>
            </CardTitle>
            <CardDescription>
              {providerConfig.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Alertas */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Campos do provedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providerConfig.fields.map(renderField)}
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Configuração
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => loadConfig()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {Object.keys(currentConfig).length > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja limpar a configuração?')) {
                        clearConfig();
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Configuração
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teste de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Testar Configuração</span>
          </CardTitle>
          <CardDescription>
            Envie um e-mail de teste para verificar se a configuração está funcionando
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="email@teste.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleTest}
                disabled={isTesting || !testEmail}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Testar
                  </>
                )}
              </Button>
            </div>

            {lastTestResult && (
              <Alert variant={lastTestResult.success ? 'default' : 'destructive'}>
                {lastTestResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {lastTestResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSettings;