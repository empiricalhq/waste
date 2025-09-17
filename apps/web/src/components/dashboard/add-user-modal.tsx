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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUp } from '@/features/auth/actions';
import { type SignUpSchema, signUpSchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';

function AddUserForm({ onClose }: { onClose: () => void }) {
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
        toast.success('User created successfully!');
        onClose();
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <InputStartIcon icon={UserIcon}>
                  <Input
                    placeholder="John Doe"
                    className={cn(fieldState.error && 'border-destructive')}
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
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <InputStartIcon icon={MailIcon}>
                  <Input
                    placeholder="user@example.com"
                    className={cn(fieldState.error && 'border-destructive')}
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
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <InputStartIcon icon={AtSign}>
                  <Input
                    placeholder="johndoe"
                    className={cn(fieldState.error && 'border-destructive')}
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
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <InputPasswordContainer>
                  <Input
                    placeholder="••••••••"
                    className={cn(fieldState.error && 'border-destructive')}
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
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <InputPasswordContainer>
                  <Input
                    placeholder="••••••••"
                    className={cn(fieldState.error && 'border-destructive')}
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
          name="gender"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <GenderRadioGroup value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="role"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <RoleSelect value={field.value} onChange={field.onChange} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          Create User
        </Button>
      </form>
    </Form>
  );
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <AddUserForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
