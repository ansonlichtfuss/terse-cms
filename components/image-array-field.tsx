'use client';

import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

import { ImageItem } from '@/components/image-item';
import { MediaDialog } from '@/components/media-dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import type { ImageArrayFieldProps } from '@/types';

export function ImageArrayField({ name, value, path, onChange, onAddItem, onRemoveItem }: ImageArrayFieldProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const handleMediaSelect = async (url: string) => {
    if (activeImageIndex !== null) {
      const newValue = [...value];
      newValue[activeImageIndex] = {
        ...newValue[activeImageIndex],
        url: url
      };
      onChange(path, newValue);
    }
    setIsMediaDialogOpen(false);
    setActiveImageIndex(null);
  };

  const openMediaDialog = (index: number) => {
    setActiveImageIndex(index);
    setIsMediaDialogOpen(true);
  };

  // Function to move an item up in the array
  const moveItemUp = (index: number) => {
    if (index <= 0) return; // Can't move the first item up

    const newValue = [...value];
    const temp = newValue[index];
    newValue[index] = newValue[index - 1];
    newValue[index - 1] = temp;

    onChange(path, newValue);
  };

  // Function to move an item down in the array
  const moveItemDown = (index: number) => {
    if (index >= value.length - 1) return; // Can't move the last item down

    const newValue = [...value];
    const temp = newValue[index];
    newValue[index] = newValue[index + 1];
    newValue[index + 1] = temp;

    onChange(path, newValue);
  };

  // Custom function to add a new image item with only url and alt fields
  const handleAddImageItem = () => {
    const newItem = {
      url: '',
      alt: ''
    };

    const newValue = [...value, newItem];
    onChange(path, newValue);
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
              {isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Label className="capitalize cursor-pointer">{name}</Label>
            </Button>
          </CollapsibleTrigger>
          <Button variant="outline" size="sm" onClick={handleAddImageItem}>
            <Plus className="h-3 w-3 mr-1" />
            Add Image
          </Button>
        </div>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {value.map((item, index) => (
              <ImageItem
                key={index}
                item={item}
                index={index}
                path={path}
                onChange={onChange}
                onRemoveItem={onRemoveItem}
                onMoveUp={moveItemUp}
                onMoveDown={moveItemDown}
                openMediaDialog={openMediaDialog}
                isFirst={index === 0}
                isLast={index === value.length - 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <MediaDialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen} onSelect={handleMediaSelect} />
    </>
  );
}
