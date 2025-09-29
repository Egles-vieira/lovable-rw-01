// src/components/auth/SessionStatus.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  CheckCircle,
  Wifi,
  WifiOff,
  Shield
} from 'lucide-react';

const SessionStatus = ({ 
  showInline = false, 
  showWarningDialog = true,
  warningThreshold = 5 * 60 * 1000 // 5 minutos em ms
}) => {
  const { 
    isAuthenticated, 
    sessionExpiry, 
    lastActivity,
    isSessionExpiringSoon,
    getSessionTimeRemaining,
    logout
  } = useAuth();
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  
  // Atualizar tempo restante
  useEffect(() => {
    if (!isAuthenticated || !sessionExpiry) return;
    
    const interval = setInterval(() => {
      const remaining = getSessionTimeRemaining();
      setTimeRemaining(remaining);
      
      // Mostrar aviso se a sessão está próxima do vencimento
      if (showWarningDialog && remaining <= warningThreshold && remaining > 0 && !showWarning) {
        setShowWarning(true);
      }
      
      // Se o tempo acabou, fazer logout
      if (remaining <= 0) {
        logout();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, sessionExpiry, getSessionTimeRemaining, warningThreshold, showWarningDialog, showWarning, logout]);
  
  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Formatar tempo
  const formatTime = (ms) => {
    if (ms <= 0) return '0:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Obter cor baseada no tempo restante
  const getTimeColor = (ms) => {
    if (ms <= 1 * 60 * 1000) return 'text-red-600'; // 1 minuto
    if (ms <= 5 * 60 * 1000) return 'text-orange-600'; // 5 minutos
    if (ms <= 15 * 60 * 1000) return 'text-yellow-600'; // 15 minutos
    return 'text-green-600';
  };
  
  // Obter porcentagem para progress bar (assumindo sessão de 1 hora)
  const getTimeProgress = (ms) => {
    const totalSession = 60 * 60 * 1000; // 1 hora
    return Math.max(0, Math.min(100, (ms / totalSession) * 100));
  };
  
  // Estender sessão (simulado)
  const handleExtendSession = async () => {
    try {
      // Aqui você faria uma chamada para estender a sessão
      // await authService.extendSession();
      
      // Por enquanto, vamos simular fechando o dialog
      setShowWarning(false);
      setLastSync(new Date());
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
    }
  };
  
  if (!isAuthenticated) return null;
  
  // Componente inline (para header/navbar)
  if (showInline) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        {/* Status de conexão */}
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
        </div>
        
        {/* Tempo da sessão */}
        {sessionExpiry && (
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className={getTimeColor(timeRemaining)}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
        
        {/* Indicador de status */}
        <Badge 
          variant={isSessionExpiringSoon() ? 'destructive' : 'default'} 
          className="text-xs"
        >
          {isSessionExpiringSoon() ? 'Expirando' : 'Ativo'}
        </Badge>
      </div>
    );
  }
  
  return (
    <>
      {/* Dialog de aviso de expiração */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Sessão Expirando</span>
            </DialogTitle>
            <DialogDescription>
              Sua sessão expirará em {formatTime(timeRemaining)}. 
              Deseja estender sua sessão?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tempo restante:</span>
                <span className={getTimeColor(timeRemaining)}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Progress 
                value={getTimeProgress(timeRemaining)} 
                className="h-2"
              />
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Por segurança, sua sessão será encerrada automaticamente.
                Salve seu trabalho antes que isso aconteça.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={logout}
              className="flex-1"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair Agora
            </Button>
            <Button
              onClick={handleExtendSession}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Estender Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Card de status completo (para página de perfil) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Status da Sessão</span>
          </CardTitle>
          <CardDescription>
            Informações sobre sua sessão atual e conectividade
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status de conexão */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">Conectividade</span>
            </div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          {/* Status da sessão */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Status da Sessão</span>
            </div>
            <Badge variant={isSessionExpiringSoon() ? 'destructive' : 'default'}>
              {isSessionExpiringSoon() ? 'Expirando' : 'Ativa'}
            </Badge>
          </div>
          
          {/* Tempo restante */}
          {sessionExpiry && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Tempo Restante</span>
                </div>
                <span className={`font-mono ${getTimeColor(timeRemaining)}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Progress 
                value={getTimeProgress(timeRemaining)} 
                className="h-2"
              />
            </div>
          )}
          
          {/* Última atividade */}
          {lastActivity && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Última Atividade</span>
              <span className="text-sm text-gray-600">
                {new Date(lastActivity).toLocaleString()}
              </span>
            </div>
          )}
          
          {/* Última sincronização */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="font-medium">Última Sincronização</span>
            <span className="text-sm text-gray-600">
              {lastSync.toLocaleString()}
            </span>
          </div>
          
          {/* Ações */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={handleExtendSession}
              className="flex-1"
              disabled={!isOnline}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Estender Sessão
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="flex-1"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Encerrar Sessão
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SessionStatus;