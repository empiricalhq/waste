'use client';

import { Eye, EyeOff } from 'lucide-react';
import { cloneElement, isValidElement, type ReactElement, useState } from 'react';

interface InputPasswordContainerProps {
  children: ReactElement<{ type?: string }>;
}

export function InputPasswordContainer({ children }: InputPasswordContainerProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="space-y-2">
      <div className="relative">
        {isValidElement(children) &&
          cloneElement(children, {
            type: isVisible ? 'text' : 'password',
          })}
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
