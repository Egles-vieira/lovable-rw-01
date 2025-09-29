// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  User,
  Building2,
  Users,
  FileText,
  BarChart3,
  Package,
  MapPin,
  ClipboardList,
  AlertCircle,
  Truck,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Menu items com controle de acesso
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['admin', 'gestor', 'operador', 'user'],
    },
    {
      title: 'Transportadoras',
      icon: Building2,
      href: '/transportadoras',
      roles: ['admin', 'gestor'],
    },
    {
      title: 'Clientes',
      icon: Users,
      href: '/clientes',
      roles: ['admin', 'gestor', 'operador'],
    },
    {
      title: 'Notas Fiscais',
      icon: FileText,
      href: '/notas-fiscais',
      roles: ['admin', 'gestor', 'operador', 'user'],
      badge: '12', // Exemplo de contador
    },
    {
      title: 'Embarcadores',
      icon: Package,
      href: '/embarcadores',
      roles: ['admin', 'gestor'],
    },
    {
      title: 'Motoristas',
      icon: User,
      href: '/motoristas',
      roles: ['admin', 'gestor', 'operador'],
    },
    {
      title: 'Romaneios',
      icon: ClipboardList,
      href: '/romaneios',
      roles: ['admin', 'gestor', 'operador'],
    },
    {
      title: 'Ocorrências',
      icon: AlertCircle,
      href: '/ocorrencias',
      roles: ['admin', 'gestor'],
    },
    {
      title: 'Monitoramento',
      icon: BarChart3,
      href: '/monitoring',
      roles: ['admin', 'gestor'],
    },
    {
      title: 'Configurações',
      icon: Settings,
      href: '/configuracoes',
      roles: ['admin'],
    },
    {
      title: 'Admin Settings',
      icon: Settings,
      href: '/admin/settings',
      roles: ['admin'],
      isAdmin: true,
    },
  ];
  
  // Filtrar menu items baseado na role do usuário
  const visibleMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );
  
  // Verificar se o item está ativo
  const isActiveRoute = (href) => {
    return location.pathname.startsWith(href);
  };
  
  // Obter iniciais do usuário para o avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
  };
  
  // Cor do badge baseado na role
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      gestor: 'bg-blue-100 text-blue-800',
      operador: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || colors.user;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
          'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg">
              <Truck className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Road-RW
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                  item.isAdmin && 'border-l-4 border-blue-500'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn('w-5 h-5', sidebarCollapsed && 'mx-auto')} />
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Bottom section - User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <Avatar className="mx-auto">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </aside>
      
      {/* Main content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Sidebar collapse button for desktop */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Search */}
              <div className="hidden md:flex items-center w-96">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User role badge */}
              <Badge className={cn('hidden sm:inline-flex', getRoleBadgeColor(user?.role))}>
                {user?.role}
              </Badge>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block">{user?.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Settings</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;