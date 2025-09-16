'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddUserModal } from '@/components/dashboard/add-user-modal';

export function AddUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddUser = (user: { name: string; email: string; phone: string; role: string }) => {
    console.log('Nuevo usuario agregado:', user);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Agregar Usuario
      </Button>
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddUser}
      />
    </>
  );
}
