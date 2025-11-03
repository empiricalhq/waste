'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthContainer } from '@/components/auth/auth-container';
import { InputPasswordContainer } from '@/components/auth/input-password';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/features/auth/actions';
import { type SignInSchema, signInSchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';

export function LoginForm({ className }: React.ComponentProps<'div'>) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(data: SignInSchema) {
    startTransition(async () => {
      const result = await signIn(data);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  const getInputClassName = (hasError: boolean) => cn(hasError && 'border-destructive');

  return (
    <AuthContainer
      className={className}
      showBrandImage={true}
      footer={
        <div className="text-muted-foreground text-center text-xs text-balance">
          Al dar click en continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="text-muted-foreground text-balance">Iniciar sesión en Lima Limpia</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex w-full flex-col gap-5">
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
                    placeholder=""
                    className={cn('pe-9', getInputClassName(Boolean(fieldState.error)))}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 transition-colors duration-200 ease-out hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
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

          <Button type="submit" disabled={isPending} className="mt-2 w-full cursor-pointer">
            Iniciar sesión
          </Button>
        </form>
      </Form>
    </AuthContainer>
  );
}
