'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputPasswordContainer } from '@/components/auth/input-password';
import { resetPassword } from '@/features/auth/actions';
import { resetPasswordSchema, type ResetPasswordSchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { 
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (error) {
      toast.error('El enlace de restablecimiento es inválido o ha expirado');
    }
    if (!token && !error) {
      toast.error('Falta el token de restablecimiento');
    }
  }, [error, token]);

  function onSubmit(data: ResetPasswordSchema) {
    startTransition(async () => {
      const result = await resetPassword(data);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setIsSuccess(true);
        toast.success(result.message);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      }
    });
  }

  const getInputClassName = (hasError: boolean) => cn(hasError && 'border-destructive');

  if (error || (!token && !isSuccess)) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 text-red-600 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-8 w-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">Enlace inválido</h1>
              <p className="text-muted-foreground mt-2 text-balance">
                El enlace de restablecimiento es inválido o ha expirado.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/forgot-password">
                  <Button>Solicitar nuevo enlace</Button>
                </Link>
                <Link href="/signin">
                  <Button variant="outline">Iniciar sesión</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 text-green-600 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-8 w-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">¡Contraseña actualizada!</h1>
              <p className="text-muted-foreground mt-2 text-balance">
                Tu contraseña ha sido restablecida exitosamente. Serás redirigido a la página de inicio de sesión.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
              {/* Hidden token field */}
              <input type="hidden" {...form.register('token')} />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <FormControl>
                      <InputPasswordContainer>
                        <Input
                          id="password"
                          type="password"
                          placeholder=""
                          className={cn('pe-9', getInputClassName(Boolean(fieldState.error)))}
                          disabled={isPending}
                          {...field}
                        />
                      </InputPasswordContainer>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <FormControl>
                      <InputPasswordContainer>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder=""
                          className={cn('pe-9', getInputClassName(Boolean(fieldState.error)))}
                          disabled={isPending}
                          {...field}
                        />
                      </InputPasswordContainer>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="mt-2 w-full cursor-pointer">
                {isPending ? 'Restableciendo...' : 'Restablecer contraseña'}
              </Button>

              <div className="text-center text-sm">
                <Link href="/signin" className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                  Volver a iniciar sesión
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
