'use client';

import { useState } from 'react';
import { AddUserModal } from '@/components/dashboard/add-user-modal';

export function AddUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddUser = (user: { name: string; phone: string; role: string }) => {
    console.log('Nuevo usuario agregado:', user);
    // Aquí iría la lógica para guardar el usuario en la base de datos
  };

  return <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddUser} />;
}
