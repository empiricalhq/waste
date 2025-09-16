'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, MailIcon, UserIcon } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { GenderRadioGroup } from '../components/gender-radio-group.tsx';
import { InputPasswordContainer } from '../components/input-password.tsx';
import { InputStartIcon } from '../components/input-start-icon.tsx';
import { RoleSelect } from '../components/role-select.tsx';
import { SignUpSchema, type SignUpValues } from './validate.ts';

export default function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      gender: undefined,
      role: 'driver',
    },
  });

  function onSubmit(data: SignUpValues) {
    startTransition(async () => {
      console.log('submit data:', data);
      const response = await signUp.email(data);

      if (response.error) {
        console.log('SIGN_UP:', response.error.status);
        toast.error(response.error.message);
      } else {
        redirect('/');
      }
    });
  }

  const getInputClassName = (fieldName: keyof SignUpValues) =>
    cn(
      form.formState.errors[fieldName] &&
        'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20',
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="z-50 my-8 flex w-full flex-col gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={UserIcon}>
                  <Input
                    placeholder="Nombre"
                    className={cn('peer ps-9', getInputClassName('name'))}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={MailIcon}>
                  <Input
                    placeholder="Correo electrónico"
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={AtSign}>
                  <Input
                    placeholder="usuario"
                    className={cn('peer ps-9', getInputClassName('username'))}
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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputPasswordContainer>
                  <Input
                    className={cn('pe-9', getInputClassName('confirmPassword'))}
                    placeholder="Confirmar contraseña"
                    disabled={isPending}
                    {...field}
                  />
                </InputPasswordContainer>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Género</FormLabel>
              <GenderRadioGroup value={field.value ?? ''} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <FormControl>
                <RoleSelect value={field.value ?? ''} onChange={field.onChange} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="mt-5 w-full">
          Agregar usuario
        </Button>
      </form>
    </Form>
  );
}
