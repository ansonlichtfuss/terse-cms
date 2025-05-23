'use client';

import { ImageIcon } from 'lucide-react';
import { useState } from 'react';

import { MediaDialog } from '@/components/media-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageFieldProps {
  name: string;
  value: string;
  path: string;
  onChange: (path: string, value: string) => void;
}

export function ImageField({ name, value, path, onChange }: ImageFieldProps) {
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  const handleMediaSelect = (url: string) => {
    onChange(path, url);
    setIsMediaDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-2 gap-2 items-start">
      <Label htmlFor={path} className="capitalize text-xs pt-2">
        {name}
      </Label>
      <div className="space-y-2">
        <div className="flex gap-1">
          <Input id={path} value={value} onChange={(e) => onChange(path, e.target.value)} className="h-7 text-xs" />
          <Button variant="outline" size="sm" onClick={() => setIsMediaDialogOpen(true)} className="h-7">
            <ImageIcon className="h-3 w-3" />
          </Button>
        </div>
        {value && (
          <div className="relative aspect-video w-full max-w-md bg-muted rounded-md overflow-hidden">
            <img
              src={value || '/placeholder.svg'}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, show placeholder
                e.currentTarget.src = '/placeholder.svg?height=200&width=300';
              }}
            />
          </div>
        )}
      </div>
      <MediaDialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen} onSelect={handleMediaSelect} />
    </div>
  );
}
