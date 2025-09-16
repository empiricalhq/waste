'use client';

import type React from 'react';

import { useState } from 'react';
import { SignUpForm }from '@/app/(routes)/(auth)/signup/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: { name: string; email: string; phone: string; role: string }) => void;
}

export function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps) {
  const [name, setName] = useState('');
  const [email, _setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const _handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && phone.trim() && role.trim()) {
      onAdd({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role.trim(),
      });
      setName('');
      setPhone('');
      setRole('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar nuevo usuario</DialogTitle>
        </DialogHeader>
        <div>
          <SignUpForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
