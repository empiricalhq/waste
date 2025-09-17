'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, MailIcon, UserIcon } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GenderRadioGroup } from '@/components/auth/gender-radio-group';
import { InputPasswordContainer } from '@/components/auth/input-password';
import { InputStartIcon } from '@/components/auth/input-start-icon';
import { RoleSelect } from '@/components/auth/role-select';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUp } from '@/features/auth/actions';
import { type SignUpSchema, signUpSchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';

function SignUpForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
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

  function onSubmit(data: SignUpSchema) {
    startTransition(async () => {
      const result = await signUp(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('User created successfully! Redirecting...');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="z-50 my-8 flex w-full flex-col gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={UserIcon}>
                  <Input
                    placeholder="Full Name"
                    className={cn('peer ps-9', fieldState.error && 'border-destructive')}
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
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={MailIcon}>
                  <Input
                    placeholder="Email Address"
                    className={cn('peer ps-9', fieldState.error && 'border-destructive')}
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
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={AtSign}>
                  <Input
                    placeholder="username"
                    className={cn('peer ps-9', fieldState.error && 'border-destructive')}
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
                    className={cn('pe-9', fieldState.error && 'border-destructive')}
                    disabled={isPending}
                    type="password"
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
              <FormControl>
                <InputPasswordContainer>
                  <Input
                    placeholder="Confirm Password"
                    className={cn('pe-9', fieldState.error && 'border-destructive')}
                    disabled={isPending}
                    type="password"
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
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <GenderRadioGroup value={field.value} onValueChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <RoleSelect value={field.value} onValueChange={field.onChange} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="mt-5 w-full">
          Add User
        </Button>
      </form>
    </Form>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="border-foreground/10 flex w-full flex-col rounded-2xl border px-8 py-5 md:w-96">
        <h1 className="text-2xl font-bold">Create User</h1>
        <p className="text-muted-foreground text-sm">For internal use by administrators.</p>
        <SignUpForm />
      </div>
    </div>
  );
}
