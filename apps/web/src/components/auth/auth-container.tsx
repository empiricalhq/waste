'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthContainerProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  showBrandImage?: boolean;
  footer?: React.ReactNode;
}

export function AuthContainer({ children, showBrandImage = false, footer, className, ...props }: AuthContainerProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden'>
        <CardContent className={cn('grid p-0 md:min-h-[500px]', showBrandImage && 'md:grid-cols-2')}>
          {/* Main content */}
          <div className='p-6 md:p-8 flex items-center'>
            <div className='w-full'>{children}</div>
          </div>

          {/* Brand image column (desktop only) */}
          {showBrandImage && (
            <div className='bg-muted hidden md:flex items-center justify-center overflow-hidden'>
              <Image
                src='/lima-verde.webp'
                alt='Lima Limpia'
                fill
                className='h-full w-full object-cover dark:brightness-[0.8]'
                priority
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer content (e.g., terms and privacy) */}
      {footer && <div>{footer}</div>}
    </div>
  );
}
