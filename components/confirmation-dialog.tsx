"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  itemsList?: string[];
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
  itemsList,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {itemsList && itemsList.length > 0 && (
          <div className="my-2">
            <div className="h-[150px] border rounded-md p-2 overflow-y-auto">
              <ul className="space-y-1">
                {itemsList.map((item, index) => (
                  <li key={index} className="text-xs truncate">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="h-7 text-xs">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={`h-7 text-xs ${
              destructive ? "bg-destructive hover:bg-destructive/90" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
