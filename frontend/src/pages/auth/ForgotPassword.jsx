// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import { apiPost } from '@/services/api';

// Schema de validação para recuperação de senha
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
});

// Schema de validação para redefinir senha
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Senha deve conter: maiúscula, minúscula, número e símbolo'),
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: solicitar email, 2: sucesso, 3: redefinir senha
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();
  
  // Form para solicitar recuperação de senha
  const forgotForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });
  
  // Form para redefinir senha
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: new URLSearchParams(window.location.search).get('token') || '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  // Verificar se há token na URL (indica etapa de redefinição)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setStep(3);
      resetForm.setValue('token', token);
    }
  }, [resetForm]);
  
  // Função para solicitar recuperação de senha
  const onForgotSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await apiPost('/auth/forgot-password', {
        email: data.email
      });
      
      if (response.success) {
        setEmail(data.email);
        setStep(2);
        setSuccess('Email de recuperação enviado com sucesso!');
      } else {
        setError(response.message || 'Erro ao solicitar recuperação de senha');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.response?.status === 404) {
        setError('Email não encontrado em nosso sistema');
      } else if (err.response?.status === 429) {
        setError('Muitas tentativas. Tente novamente em alguns minutos');
      } else {
        setError('Erro ao conectar com o servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para redefinir senha
  const onResetSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await apiPost('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword
      });
      
      if (response.success) {
        setSuccess('Senha redefinida com sucesso!');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Senha alterada com sucesso. Faça login com sua nova senha.' 
            } 
          });
        }, 2000);
      } else {
        setError(response.message || 'Erro ao redefinir senha');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.response?.status === 400) {
        setError('Token inválido ou expirado');
      } else if (err.response?.status === 404) {
        setError('Token não encontrado');
      } else {
        setError('Erro ao conectar com o servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reenviar email de recuperação
  const resendEmail = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await apiPost('/auth/forgot-password', {
        email: email
      });
      
      if (response.success) {
        setSuccess('Email reenviado com sucesso!');
      } else {
        setError(response.message || 'Erro ao reenviar email');
      }
    } catch (err) {
      console.error('Resend email error:', err);
      setError('Erro ao reenviar email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {step === 1 && 'Recuperar Senha'}
            {step === 2 && 'Email Enviado'}
            {step === 3 && 'Nova Senha'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {step === 1 && 'Digite seu email para receber as instruções'}
            {step === 2 && 'Verifique sua caixa de entrada'}
            {step === 3 && 'Defina sua nova senha'}
          </p>
        </div>
        
        {/* Card Principal */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {step === 1 && (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Solicitar Recuperação</span>
                </>
              )}
              {step === 2 && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Email Enviado</span>
                </>
              )}
              {step === 3 && (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Redefinir Senha</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Informe o email da sua conta para receber o link de recuperação'}
              {step === 2 && 'Enviamos um link de recuperação para seu email'}
              {step === 3 && 'Digite sua nova senha'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Alertas */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            {/* Etapa 1 - Solicitar recuperação */}
            {step === 1 && (
              <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    autoFocus
                    disabled={isLoading}
                    {...forgotForm.register('email')}
                  />
                  {forgotForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {forgotForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Email de Recuperação
                    </>
                  )}
                </Button>
              </form>
            )}
            
            {/* Etapa 2 - Email enviado */}
            {step === 2 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Enviamos um email com instruções para:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {email}
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Não encontrou o email?</strong>
                    <br />
                    Verifique sua pasta de spam ou lixo eletrônico.
                    O link expira em 1 hora.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={resendEmail}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      'Reenviar Email'
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setStep(1)}
                    variant="ghost"
                    className="w-full"
                  >
                    Tentar outro email
                  </Button>
                </div>
              </div>
            )}
            
            {/* Etapa 3 - Redefinir senha */}
            {step === 3 && (
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Digite sua nova senha"
                    autoComplete="new-password"
                    autoFocus
                    disabled={isLoading}
                    {...resetForm.register('newPassword')}
                  />
                  {resetForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                  
                  {/* Indicador de força da senha */}
                  {resetForm.watch('newPassword') && (
                    <div className="space-y-2">
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className={resetForm.watch('newPassword').length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Mínimo 8 caracteres
                        </li>
                        <li className={/[a-z]/.test(resetForm.watch('newPassword')) ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Letra minúscula
                        </li>
                        <li className={/[A-Z]/.test(resetForm.watch('newPassword')) ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Letra maiúscula
                        </li>
                        <li className={/\d/.test(resetForm.watch('newPassword')) ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Número
                        </li>
                        <li className={/[@$!%*?&]/.test(resetForm.watch('newPassword')) ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Símbolo especial
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua nova senha"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...resetForm.register('confirmPassword')}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !resetForm.formState.isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Redefinir Senha'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          © 2024 Road-RW Logística. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;