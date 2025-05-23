'use client';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { MediaManager } from '@/components/media-manager';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-media-query';

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export function MediaDialog({ open, onOpenChange, onSelect }: MediaDialogProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${isMobile ? 'w-[95vw] max-w-[95vw] h-[90vh] p-3' : 'sm:max-w-[800px] h-[600px]'} flex flex-col`}
        onInteractOutside={(e) => e.preventDefault()} // Prevent closing when clicking outside on mobile
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 space-x-2 pb-2">
          <DialogTitle>Media Library</DialogTitle>
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <MediaManager onSelect={handleSelect} isMobile={isMobile} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
