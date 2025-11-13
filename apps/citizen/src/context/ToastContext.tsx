import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning" | "default";
export type ToastPosition = "top" | "bottom";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  duration?: number;
  type?: ToastType;
  position?: ToastPosition;
  action?: ToastAction;
  onClose?: () => void;
}

export interface Toast {
  id: string;
  content: React.ReactNode | string;
  options: Required<Omit<ToastOptions, "action">> & {
    action: ToastAction | null;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  show: (content: React.ReactNode | string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_OPTIONS: Required<Omit<ToastOptions, "action">> & {
  action: ToastAction | null;
} = {
  duration: 3000,
  type: "default",
  position: "bottom",
  action: null,
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op for the default options
  onClose: () => {},
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // clean up all timers when the provider unmounts
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    // clear the timer if it exists
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }

    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast) {
        toast.options.onClose();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const show = useCallback(
    (content: React.ReactNode | string, options?: ToastOptions): string => {
      const id = Math.random().toString(36).substring(2, 9);
      const toastOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        action: options?.action || null,
      };
      const toast: Toast = { id, content, options: toastOptions };

      setToasts((prev) => [...prev, toast]);

      // if duration is greater than 0, set a timer to dismiss it
      if (toastOptions.duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, toastOptions.duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  const dismissAll = useCallback(() => {
    // clear all timers before removing toasts
    for (const timer of timersRef.current.values()) {
      clearTimeout(timer);
    }
    timersRef.current.clear();
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss, dismissAll }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
