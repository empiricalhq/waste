'use client';

import { SignUpForm } from '@/app/(routes)/(auth)/signup/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: { name: string; email: string; phone: string; role: string }) => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {

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
