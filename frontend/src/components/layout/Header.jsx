// src/components/layout/Header.jsx
import React from 'react';
import { Bell, User, LogOut, Server } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useEnvironment } from '@/contexts/EnvironmentContext'; // ← NOVO IMPORT

const Header = () => {
  const { user, logout } = useAuth();
  const { environment, isProduction } = useEnvironment(); // ← USANDO CONTEXT
  const navigate = useNavigate();

  // Função para obter o ambiente atual
  const getCurrentEnvironment = () => {
    return localStorage.getItem('apiEnvironment') || 'development';
  };

  // Função para obter as iniciais do usuário
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
  };

  // Função para obter a cor do badge baseado na role
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      gestor: 'bg-blue-100 text-blue-800 border-blue-200',
      operador: 'bg-green-100 text-green-800 border-green-200',
      user: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[role] || colors.user;
  };

  // Função para obter a cor do badge de ambiente
  const getEnvironmentBadgeColor = () => {
    const env = getCurrentEnvironment();
    return env === 'production' 
      ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
      : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100';
  };

  // Função para obter o texto do ambiente
  const getEnvironmentText = () => {
    const env = getCurrentEnvironment();
    return env === 'production' ? 'PRODUÇÃO' : 'DESENVOLVIMENTO';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Lado esquerdo - Logo e título */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Road RW
          </h1>
          
          {/* Badge de ambiente apenas para admin */}
            {user?.role === 'admin' && (
                <Badge 
                variant="outline" 
                className={cn(
                    'cursor-pointer transition-colors',
                    isProduction 
                    ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                    : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                )}
                onClick={() => navigate('/admin/settings')}
                >
                <Server className="w-3 h-3 mr-1" />
                {isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}
                </Badge>
            )}
        </div>
        
        {/* Lado direito - Notificações e perfil */}
        <div className="flex items-center space-x-4">
          {/* Botão de notificações */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          
          {/* Badge da role do usuário */}
          <Badge className={cn('hidden sm:inline-flex', getRoleBadgeColor(user?.role))}>
            {user?.role?.toUpperCase() || 'USER'}
          </Badge>
          
          {/* Menu dropdown do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <DropdownMenuLabel className="text-gray-900 dark:text-white">
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
              
              <DropdownMenuItem 
                onClick={() => navigate('/perfil')}
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              
              {/* Link para configurações de admin apenas para administradores */}
              {user?.role === 'admin' && (
                <DropdownMenuItem 
                  onClick={() => navigate('/admin/settings')}
                  className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Server className="mr-2 h-4 w-4" />
                  <span>Configurações de Ambiente</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={() => navigate('/configuracoes')}
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
              
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Barra de informações do ambiente (apenas para admin em produção) */}
      {user?.role === 'admin' && getCurrentEnvironment() === 'production' && (
        <div className="mt-2 flex justify-center">
          <div className="bg-red-50 border border-red-200 rounded-md px-3 py-1">
            <p className="text-xs text-red-700 font-medium flex items-center">
              <Server className="w-3 h-3 mr-1" />
              ⚠️ MODO PRODUÇÃO - Todas as alterações afetarão dados reais
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;