// src/components/shared/PagePlaceholder.jsx

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PagePlaceholder() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Página em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Esta página está em desenvolvimento e será implementada em breve.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}