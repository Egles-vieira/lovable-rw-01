// src/pages/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, Truck, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';

// Schema de validação
const registerSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Senha deve conter: maiúscula, minúscula, número e símbolo'),
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
  telefone: z.string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .regex(/^[\d\s\(\)\-\+]+$/, 'Formato de telefone inválido')
    .optional(),
  empresa: z.string()
    .min(2, 'Nome da empresa deve ter no mínimo 2 caracteres')
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres')
    .optional(),
  cargo: z.string()
    .min(2, 'Cargo deve ter no mínimo 2 caracteres')
    .max(50, 'Cargo deve ter no máximo 50 caracteres')
    .optional(),
  role: z.enum(['operador', 'gestor'], {
    errorMap: () => ({ message: 'Selecione um tipo de usuário válido' })
  }),
  acceptTerms: z.boolean()
    .refine((val) => val === true, 'Você deve aceitar os termos e condições'),
  acceptPrivacy: z.boolean()
    .refine((val) => val === true, 'Você deve aceitar a política de privacidade')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Para formulário em etapas
  
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Configurar react-hook-form com zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
    trigger,
    control
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      confirmPassword: '',
      telefone: '',
      empresa: '',
      cargo: '',
      role: '',
      acceptTerms: false,
      acceptPrivacy: false
    }
  });
  
  const watchedFields = watch();
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Função de submit do formulário
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Mapear campos para o formato esperado pelo backend
      const userData = {
        name: data.nome.trim(), // Backend espera 'name'
        email: data.email.trim(),
        password: data.password,
        password_confirmation: data.confirmPassword, // Backend espera 'password_confirmation'
        telefone: data.telefone?.replace(/\D/g, '') || null,
        empresa: data.empresa?.trim() || null,
        cargo: data.cargo?.trim() || null,
        role: data.role
      };
      
      // Fazer registro
      const result = await registerUser(userData);
      
      if (!result.success) {
        // Tratar erros específicos do backend
        if (result.errors && Array.isArray(result.errors)) {
          // Mapear erros dos campos para nomes em português
          const fieldMap = {
            name: 'Nome',
            email: 'Email',
            password: 'Senha',
            password_confirmation: 'Confirmação de senha',
            telefone: 'Telefone',
            empresa: 'Empresa',
            cargo: 'Cargo',
            role: 'Tipo de usuário'
          };
          
          const errorMessages = result.errors.map(error => 
            `${fieldMap[error.field] || error.field}: ${error.message}`
          ).join('\n');
          
          setError(errorMessages);
        } else {
          setError(result.message || 'Erro ao criar conta');
        }
      }
    } catch (err) {
      console.error('Register error:', err);
      
      // Tratar diferentes tipos de erro
      if (err.response) {
        // Erro da resposta HTTP
        const { status, data } = err.response;
        
        if (status === 422 && data.errors) {
          // Erros de validação
          const fieldMap = {
            name: 'Nome',
            email: 'Email', 
            password: 'Senha',
            password_confirmation: 'Confirmação de senha',
            telefone: 'Telefone',
            empresa: 'Empresa',
            cargo: 'Cargo',
            role: 'Tipo de usuário'
          };
          
          const errorMessages = data.errors.map(error => 
            `${fieldMap[error.field] || error.field}: ${error.message}`
          ).join('\n');
          
          setError(errorMessages);
        } else if (status === 409) {
          setError('Este email já está em uso. Tente fazer login ou use outro email.');
        } else if (status === 400) {
          setError(data.message || 'Dados inválidos. Verifique as informações fornecidas.');
        } else {
          setError(data.message || `Erro no servidor (${status}). Tente novamente.`);
        }
      } else if (err.request) {
        // Erro de rede
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Outros erros
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para validar etapa
  const validateStep = async (stepNumber) => {
    const fieldsToValidate = {
      1: ['nome', 'email'],
      2: ['password', 'confirmPassword'],
      3: ['role', 'acceptTerms', 'acceptPrivacy']
    };
    
    const result = await trigger(fieldsToValidate[stepNumber]);
    return result;
  };
  
  // Avançar para próxima etapa
  const nextStep = async () => {
    const isStepValid = await validateStep(step);
    if (isStepValid && step < 3) {
      setStep(step + 1);
    }
  };
  
  // Voltar etapa
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Formatação de telefone
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };
  
  // Verificação de força da senha
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    if (score < 3) return { strength: 'fraca', color: 'bg-red-500', text: 'Fraca' };
    if (score < 5) return { strength: 'média', color: 'bg-yellow-500', text: 'Média' };
    return { strength: 'forte', color: 'bg-green-500', text: 'Forte' };
  };
  
  const passwordStrength = getPasswordStrength(watchedFields.password || '');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Criar Conta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Junte-se ao Road-RW Logística
          </p>
        </div>
        
        {/* Indicador de progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <CheckCircle className="w-4 h-4" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-full h-1 mx-2 rounded ${
                    step > num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Dados Pessoais</span>
            <span>Segurança</span>
            <span>Finalização</span>
          </div>
        </div>
        
        {/* Card de Registro */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 1 && 'Informações Pessoais'}
              {step === 2 && 'Definir Senha'}
              {step === 3 && 'Finalizar Cadastro'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Preencha seus dados básicos'}
              {step === 2 && 'Crie uma senha segura'}
              {step === 3 && 'Defina seu perfil e aceite os termos'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Alerta de erro */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="whitespace-pre-line">
                      {error}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Etapa 1 - Dados Pessoais */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      autoComplete="name"
                      disabled={isLoading}
                      {...register('nome')}
                    />
                    {errors.nome && (
                      <p className="text-sm text-red-500">{errors.nome.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
                      disabled={isLoading}
                      {...register('telefone')}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setValue('telefone', formatted);
                      }}
                    />
                    {errors.telefone && (
                      <p className="text-sm text-red-500">{errors.telefone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      type="text"
                      placeholder="Nome da sua empresa"
                      autoComplete="organization"
                      disabled={isLoading}
                      {...register('empresa')}
                    />
                    {errors.empresa && (
                      <p className="text-sm text-red-500">{errors.empresa.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      type="text"
                      placeholder="Seu cargo na empresa"
                      autoComplete="organization-title"
                      disabled={isLoading}
                      {...register('cargo')}
                    />
                    {errors.cargo && (
                      <p className="text-sm text-red-500">{errors.cargo.message}</p>
                    )}
                  </div>
                </>
              )}
              
              {/* Etapa 2 - Senha */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crie uma senha segura"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {watchedFields.password && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded">
                            <div 
                              className={`h-full rounded transition-all ${passwordStrength.color}`}
                              style={{ width: `${(watchedFields.password.length / 12) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordStrength.strength === 'forte' ? 'text-green-600' :
                            passwordStrength.strength === 'média' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li className={watchedFields.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Mínimo 8 caracteres
                          </li>
                          <li className={/[a-z]/.test(watchedFields.password) ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Letra minúscula
                          </li>
                          <li className={/[A-Z]/.test(watchedFields.password) ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Letra maiúscula
                          </li>
                          <li className={/\d/.test(watchedFields.password) ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Número
                          </li>
                          <li className={/[@$!%*?&]/.test(watchedFields.password) ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Símbolo especial
                          </li>
                        </ul>
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirme sua senha"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {watchedFields.confirmPassword && watchedFields.password !== watchedFields.confirmPassword && (
                      <p className="text-sm text-red-500">As senhas não coincidem</p>
                    )}
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </>
              )}
              
              {/* Etapa 3 - Finalização */}
              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="role">Tipo de Usuário *</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {watchedFields.role 
                            ? watchedFields.role === 'operador' 
                              ? 'Operador' 
                              : 'Gestor'
                            : 'Selecione seu perfil'
                          }
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onSelect={() => setValue('role', 'operador')}>
                          Operador
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setValue('role', 'gestor')}>
                          Gestor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {errors.role && (
                      <p className="text-sm text-red-500">{errors.role.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        {...register('acceptTerms')}
                        onCheckedChange={(checked) => setValue('acceptTerms', checked)}
                      />
                      <Label 
                        htmlFor="acceptTerms" 
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        Eu aceito os{' '}
                        <Link to="/termos" className="text-blue-600 hover:underline">
                          Termos e Condições
                        </Link>{' '}
                        de uso do sistema
                      </Label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptPrivacy"
                        {...register('acceptPrivacy')}
                        onCheckedChange={(checked) => setValue('acceptPrivacy', checked)}
                      />
                      <Label 
                        htmlFor="acceptPrivacy" 
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        Eu aceito a{' '}
                        <Link to="/privacidade" className="text-blue-600 hover:underline">
                          Política de Privacidade
                        </Link>
                      </Label>
                    </div>
                    {errors.acceptPrivacy && (
                      <p className="text-sm text-red-500">{errors.acceptPrivacy.message}</p>
                    )}
                  </div>
                </>
              )}
              
              {/* Botões de navegação */}
              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                  >
                    Anterior
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className={step === 1 ? 'ml-auto' : ''}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !watchedFields.role || !watchedFields.acceptTerms || !watchedFields.acceptPrivacy}
                    className="ml-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Entrar
              </Link>
            </div>
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

export default Register;