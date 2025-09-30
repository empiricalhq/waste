'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createDriver } from '@/features/drivers/actions';
import { type CreateDriverSchema, createDriverSchema } from '@/features/drivers/schemas';
import { FormDialog } from '../common/form-dialog';

export function AddDriverDialog() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateDriverSchema>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(data: CreateDriverSchema) {
    startTransition(async () => {
      const result = await createDriver(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Chofer agregado exitosamente');
        form.reset();
      }
    });
  }

  return (
    <FormDialog
      title="Registro de datos"
      description="El conductor podrá usar estas credenciales para iniciar sesión en la app móvil disponible solo para conductores"
      trigger={
        <Button size="sm" className="cursor-pointer">
          <Plus className="me-2 size-4" />
          Añadir conductor
        </Button>
      }
      contentClassName="sm:max-w-lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            Guardar
          </Button>
        </form>
      </Form>
    </FormDialog>
  );
}
