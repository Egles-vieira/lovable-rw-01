// src/components/ErrorBoundary.jsx

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
                  <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
                Ops! Algo deu errado
              </h1>

              {/* Description */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada e 
                estamos trabalhando para resolver o problema.
              </p>

              {/* Error Details (apenas em desenvolvimento) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        Ver Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-64 text-gray-700 dark:text-gray-300">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recarregar Página
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Se o problema persistir, entre em contato com o suporte em{' '}
                  <a 
                    href="mailto:suporte@roadrw.com.br" 
                    className="text-blue-600 hover:underline"
                  >
                    suporte@roadrw.com.br
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;