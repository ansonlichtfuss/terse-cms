import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (folderName: string) => Promise<void>;
  isMobile?: boolean;
  isCreating: boolean; // Add isCreating prop
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  onCreate,
  isMobile = false,
  isCreating,
}: CreateFolderDialogProps) {
  const [newFolderName, setNewFolderName] = useState("");
  // isCreating state is now received as a prop
  // const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    try {
      await onCreate(newFolderName);
      setNewFolderName(""); // Clear input on success
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      // Error handling is done in useFileOperations, just prevent dialog close on error
      console.error("Error creating folder:", error);
    }
    // setIsCreating is now managed by the parent component
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFolderName(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newFolderName.trim() && !isCreating) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "w-[95vw] max-w-[95vw]" : ""}>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isCreating}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!newFolderName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
