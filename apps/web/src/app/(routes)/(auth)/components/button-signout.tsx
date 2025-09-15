'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/client';

export default function SignOutButton() {
  const [isPending, setIsPending] = useState(false);

  const onSignOut = async () => {
    setIsPending(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          setIsPending(false);
          redirect('/');
        },
      },
    });
  };

  return (
    <Button disabled={isPending} onClick={onSignOut} variant="destructive">
      Cerrar sesión
    </Button>
  );
}
