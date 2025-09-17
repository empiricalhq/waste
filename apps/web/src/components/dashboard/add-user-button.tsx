'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/features/auth/client';
import { AddUserModal } from './add-user-modal';

export function AddUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (session?.user?.appRole !== 'admin') {
    return null;
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Add User</Button>
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
