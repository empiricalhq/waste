'use client';

import { useState } from 'react';
import { AddUserModal } from '@/components/dashboard/add-user-modal';
import { Button } from '@/components/ui/button';

export function AddUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddUser = (_user: { name: string; email: string; phone: string; role: string }) => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button className="cursor-pointer bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => setIsModalOpen(true)}>Agregar Usuario</Button>
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddUser} />
    </>
  );
}
