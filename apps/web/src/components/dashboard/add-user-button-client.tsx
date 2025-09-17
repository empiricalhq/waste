'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddUserModal } from './add-user-modal';

export function AddUserButtonClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Añadir usuario</Button>
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
