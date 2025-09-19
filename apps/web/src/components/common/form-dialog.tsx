'use client';

import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface FormDialogProps extends PropsWithChildren {
  title: string;
  description?: string;
  trigger: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
}

/**
 * A generic dialog component for forms.
 */
export function FormDialog({
  title,
  description,
  trigger,
  open,
  onOpenChange,
  children,
  contentClassName,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild={true}>{trigger}</DialogTrigger>
      <DialogContent className={cn('sm:max-w-[600px] max-h-[90vh] flex flex-col', contentClassName)}>
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
