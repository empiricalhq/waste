'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {}, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-red-900">Error en el Dashboard</CardTitle>
          <CardDescription className="text-red-700">
            No se pudieron cargar los datos del dashboard. Por favor intenta nuevamente.
          </CardDescription>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">Detalles técnicos</summary>
              <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
        </CardHeader>
        <CardContent className="flex gap-2 justify-center">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button asChild={true} variant="ghost" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
