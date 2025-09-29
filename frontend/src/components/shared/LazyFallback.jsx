// src/components/shared/LazyFallback.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LazyFallback = ({ componentName = "Componente" }) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Carregando {componentName}...</p>
    </div>
  </div>
);