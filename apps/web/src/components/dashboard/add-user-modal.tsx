'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, MailIcon, UserIcon } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { InputStartIcon } from '@/components/auth/input-start-icon';
import { RoleSelect } from '@/components/auth/role-select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUp } from '@/features/auth/actions';
import { type SignUpSchema, signUpSchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';

interface TextInputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  icon?: React.ElementType;
  type?: string;
  disabled?: boolean;
  control: any;
}

function TextInputField({
  name,
  label,
  placeholder,
  icon: Icon,
  type = 'text',
  disabled,
  control,
}: TextInputFieldProps) {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {Icon ? (
              <InputStartIcon icon={Icon}>
                <Input
                  type={type}
                  placeholder={placeholder}
                  className={cn(fieldState.error && 'border-destructive')}
                  disabled={disabled}
                  {...field}
                />
              </InputStartIcon>
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                className={cn(fieldState.error && 'border-destructive')}
                disabled={disabled}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

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
        toast.success(`Usuario creado: ${data.username}`);
        onClose();
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        <TextInputField
          name="name"
          label="Nombre completo"
          placeholder="John Doe"
          icon={UserIcon}
          disabled={isPending}
          control={form.control}
        />
        <TextInputField
          name="email"
          label="Email"
          placeholder="user@example.com"
          icon={MailIcon}
          disabled={isPending}
          control={form.control}
        />
        <TextInputField
          name="username"
          label="Username"
          placeholder="johndoe"
          icon={AtSign}
          disabled={isPending}
          control={form.control}
        />
        <TextInputField
          name="password"
          label="Password"
          placeholder="••••••••"
          type="password"
          disabled={isPending}
          control={form.control}
        />
        <TextInputField
          name="confirmPassword"
          label="Confirm Password"
          placeholder="••••••••"
          type="password"
          disabled={isPending}
          control={form.control}
        />

        <FormField
          name="role"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <FormControl>
                <RoleSelect value={field.value} onChange={field.onChange} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          Crear usuario
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
          <DialogTitle>Añadir nuevo usuario</DialogTitle>
        </DialogHeader>
        <AddUserForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
