import { useState } from 'react';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  txHash?: string;
  tokenUrl?: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string, 
    type: ToastType, 
    txHash?: string, 
    tokenUrl?: string
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, txHash, tokenUrl }]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, showToast, hideToast };
}; 