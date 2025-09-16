'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { InputPasswordContainer } from '../components/input-password.tsx';
import { InputStartIcon } from '../components/input-start-icon.tsx';
import { SignInSchema, type SignInValues } from './validate.ts';

export function SignInForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: SignInValues) {
    startTransition(async () => {
      const response = await signIn.email(data);

      if (response.error) {
        toast.error(response.error.message);
      } else {
        router.push('/');
      }
    });
  }

  const getInputClassName = (fieldName: keyof SignInValues) =>
    cn(
      form.formState.errors[fieldName] &&
        'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20',
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="z-50 my-8 flex w-full flex-col gap-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={AtSign}>
                  <Input
                    placeholder="email"
                    type="email"
                    className={cn('peer ps-9', getInputClassName('email'))}
                    disabled={isPending}
                    {...field}
                  />
                </InputStartIcon>
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
              <FormControl>
                <InputPasswordContainer>
                  <Input
                    className={cn('pe-9', getInputClassName('password'))}
                    placeholder="Contraseña"
                    disabled={isPending}
                    {...field}
                  />
                </InputPasswordContainer>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="mt-5 w-full">
          Iniciar sesión
        </Button>
      </form>
    </Form>
  );
}
