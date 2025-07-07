import { useState } from 'react';

interface DialogState<T = any> {
  isOpen: boolean;
  item: T | null;
  openDialog: (item?: T) => void;
  closeDialog: () => void;
}

export const useDialogState = <T = any>(): DialogState<T> => {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<T | null>(null);

  const openDialog = (item?: T) => {
    if (item) setItem(item);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setItem(null);
  };

  return { isOpen, item, openDialog, closeDialog };
};