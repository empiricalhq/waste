'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { checkApiStatus } from '@/features/auth/actions/api-status';

export function ApiStatusMonitor() {
  useEffect(() => {
    let mounted = true;

    function showConnectionError() {
      if (mounted) {
        toast.error('Error de conexión', {
          description: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.',
          duration: 5000,
        });
      }
    }

    async function monitorApiStatus() {
      try {
        const isApiUp = await checkApiStatus();
        if (!isApiUp) {
          showConnectionError();
        }
      } catch {
        showConnectionError();
      }
    }

    monitorApiStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
