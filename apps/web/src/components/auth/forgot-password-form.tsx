'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/features/auth/actions';
import { requestPasswordResetSchema, type RequestPasswordResetSchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RequestPasswordResetSchema>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(data: RequestPasswordResetSchema) {
    startTransition(async () => {
      const result = await requestPasswordReset(data);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setIsSuccess(true);
        toast.success(result.message);
      }
    });
  }

  const getInputClassName = (hasError: boolean) => cn(hasError && 'border-destructive');

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
              <h1 className="text-2xl font-bold">Revisa tu correo</h1>
              <p className="text-muted-foreground mt-2 text-balance">
                Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="text-muted-foreground mt-4 text-sm">
                No olvides revisar tu carpeta de spam o correo no deseado.
              </p>
              <Link href="/signin" className="mt-6">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a iniciar sesión
                </Button>
              </Link>
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
          <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className={getInputClassName(Boolean(fieldState.error))}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full cursor-pointer">
                {isPending ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
              </Button>

              <div className="text-center">
                <Link href="/signin" className="text-muted-foreground hover:text-primary text-sm underline-offset-4 hover:underline">
                  <ArrowLeft className="mr-1 inline h-3 w-3" />
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
