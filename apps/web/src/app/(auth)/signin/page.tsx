'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InputPasswordContainer } from '@/components/auth/input-password';
import { InputStartIcon } from '@/components/auth/input-start-icon';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signIn } from '@/features/auth/actions';
import { type SignInSchema, signInSchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';

function SignInForm() {
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
      // Successful navigation is handled by the server action's `redirect`.
    });
  }

  const getInputClassName = (hasError: boolean) => cn(hasError && 'border-destructive');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="z-50 my-8 flex w-full flex-col gap-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={AtSign}>
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    className={cn('peer ps-9', getInputClassName(Boolean(fieldState.error)))}
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
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <InputPasswordContainer>
                  <Input
                    placeholder="Password"
                    type="password"
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
        <Button type="submit" disabled={isPending} className="mt-5 w-full">
          Sign In
        </Button>
      </form>
    </Form>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="border-foreground/10 flex w-full flex-col rounded-2xl border px-8 py-5 md:w-96">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <SignInForm />
        <div className="flex items-center justify-center gap-2">
          <small>Need an account? Contact an administrator.</small>
        </div>
      </div>
    </div>
  );
}
