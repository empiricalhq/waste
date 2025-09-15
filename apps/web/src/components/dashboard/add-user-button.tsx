'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { AddUserModal } from '@/components/dashboard/add-user-modal';
import { signOut } from '@/lib/auth/client';

export function AddUserButton() {
  const [_isPending, setIsPending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const _onSignOut = async () => {
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

  const handleAddUser = (user: { name: string; phone: string; role: string }) => {
    console.log('Nuevo usuario agregado:', user);
    // Aquí iría la lógica para guardar el usuario en la base de datos
  };

  return <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddUser} />;
}
