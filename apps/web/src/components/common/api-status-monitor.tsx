'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { checkApiStatus } from '@/features/auth/actions/api-status';

export function ApiStatusMonitor() {
  useEffect(() => {
    let mounted = true;

    async function monitorApiStatus() {
      try {
        const isApiUp = await checkApiStatus();
        
        if (!isApiUp && mounted) {
          toast.error('Error de conexión', {
            description: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.',
            duration: 5000,
          });
        }
      } catch (error) {
        if (mounted) {
          toast.error('Error de conexión', {
            description: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.',
            duration: 5000,
          });
        }
      }
    }

    monitorApiStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
