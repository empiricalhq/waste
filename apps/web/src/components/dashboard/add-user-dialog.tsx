'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type LucideIcon, MailIcon, UserIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { type Control, type Path, useForm } from 'react-hook-form';
import { toast } from 'sonner';
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

interface TextInputFieldProps {
  name: Path<SignUpSchema>;
  label: string;
  placeholder: string;
  icon?: LucideIcon;
  type?: string;
  disabled?: boolean;
  control: Control<SignUpSchema>;
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
  const isPassword = type === 'password';
  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {isPassword ? (
              <InputPasswordContainer>
                <Input
                  type="password"
                  placeholder={placeholder}
                  className={cn('pe-9', fieldState.error && 'border-destructive')}
                  disabled={disabled}
                  {...field}
                />
              </InputPasswordContainer>
            ) : Icon ? (
              <InputStartIcon icon={Icon}>
                <Input
                  type={type}
                  placeholder={placeholder}
                  className={cn('peer ps-9', fieldState.error && 'border-destructive')}
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

function AddUserFormFields({ control, isPending }: { control: Control<SignUpSchema>; isPending: boolean }) {
  return (
    <>
      <TextInputField
        name="name"
        label="Nombre completo"
        placeholder="Juan Pérez"
        icon={UserIcon}
        disabled={isPending}
        control={control}
      />
      <TextInputField
        name="email"
        label="Correo electrónico"
        placeholder="correo@ejemplo.com"
        icon={MailIcon}
        disabled={isPending}
        control={control}
      />
      <TextInputField
        name="password"
        label="Contraseña"
        placeholder="••••••••"
        type="password"
        disabled={isPending}
        control={control}
      />
      <TextInputField
        name="confirmPassword"
        label="Confirmar contraseña"
        placeholder="••••••••"
        type="password"
        disabled={isPending}
        control={control}
      />
      <FormField
        name="role"
        control={control}
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
    </>
  );
}

function AddUserForm({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'driver',
    },
  });

  function onSubmit(data: SignUpSchema) {
    startTransition(async () => {
      const result = await signUp(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Usuario creado: ${data.name}`);
        onClose();
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        <AddUserFormFields control={form.control} isPending={isPending} />
        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          Crear usuario
        </Button>
      </form>
    </Form>
  );
}

export function AddUserDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Añadir usuario</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir nuevo usuario</DialogTitle>
          </DialogHeader>
          <AddUserForm onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
