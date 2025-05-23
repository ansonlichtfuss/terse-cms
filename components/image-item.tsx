'use client';

import { ArrowDown, ArrowUp, ImageIcon, Loader2, Trash } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useState } from 'react'; // Keep useState for other states

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useGenerateAltTextMutation } from '@/hooks/query/useGenerateAltTextMutation';
import { getProcessedImageUrl } from '@/utils/getProcessedImageUrl';
import { getImageField } from '@/utils/media-utils';

interface ImageItemProps {
  item: any;
  index: number;
  path: string;
  onChange: (path: string, value: any) => void;
  onRemoveItem: (path: string, index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  openMediaDialog: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ImageItem({
  item,
  index,
  path,
  onChange,
  onRemoveItem,
  onMoveUp,
  onMoveDown,
  openMediaDialog,
  isFirst,
  isLast
}: ImageItemProps) {
  const imageField = getImageField(item);
  const {
    mutate: generateAltTextMutation,
    isPending: generatingAltText,
    error: generateAltTextError
  } = useGenerateAltTextMutation();
  const imageUrl = item[imageField] || '';
  const altText = item.alt || '';

  const [processedImageUrl, setProcessedImageUrl] = useState(imageUrl); // State for the processed URL
  const imageRef = useRef<HTMLImageElement>(null); // Ref for the image element

  // Effect to process the image URL when imageUrl changes or component mounts
  useEffect(() => {
    const processUrl = async () => {
      if (imageUrl && imageRef.current) {
        // Ensure the image is loaded before getting dimensions
        if (imageRef.current.complete) {
          const width = imageRef.current.clientWidth;
          const height = imageRef.current.clientHeight;
          const url = await getProcessedImageUrl(imageUrl, width, height);
          setProcessedImageUrl(url);
        } else {
          // If image is not complete, wait for it to load
          imageRef.current.onload = async () => {
            const width = imageRef.current?.clientWidth || 0;
            const height = imageRef.current?.clientHeight || 0;
            const url = await getProcessedImageUrl(imageUrl, width, height);
            setProcessedImageUrl(url);
          };
        }
      } else {
        setProcessedImageUrl(imageUrl); // Use original if no ref or URL
      }
    };
    processUrl();
  }, [imageUrl]); // Re-run when imageUrl changes

  // Function to handle URL change and trigger alt text generation
  const handleUrlChange = (newUrl: string) => {
    const newItem = {
      ...item,
      [imageField]: newUrl
    };

    // If we're using a non-standard field, also set the url field
    if (imageField !== 'url') {
      newItem.url = newUrl;
    }

    onChange(`${path}[${index}]`, newItem);
    setProcessedImageUrl(newUrl); // Update processed URL immediately on change

    // If the URL is valid and the alt text is empty, generate alt text
    if (newUrl && (!altText || altText === '')) {
      generateAltTextMutation(newUrl, {
        onSuccess: (data) => {
          if (data.altText) {
            const newItem = {
              ...item,
              alt: data.altText
            };
            onChange(`${path}[${index}]`, newItem);
            toast({
              title: 'Alt text generated'
            });
          }
        },
        onError: (error) => {
          console.error('Error generating alt text:', error);
          toast({
            title: 'Failed to generate alt text',
            variant: 'destructive'
          });
        }
      });
    }
  };

  // Handle error from mutation
  useEffect(() => {
    if (generateAltTextError) {
      console.error('Mutation error generating alt text:', generateAltTextError);
      // Optionally show a toast or handle the error in the UI
    }
  }, [generateAltTextError]);

  return (
    <Card className="border overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {imageUrl ? (
          <img
            ref={imageRef} // Attach the ref
            src={processedImageUrl || '/placeholder.svg'} // Use the processed URL
            alt={altText || `Image ${index + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, show placeholder
              e.currentTarget.src = '/placeholder.svg?height=200&width=300';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-background/80 hover:bg-background"
            onClick={() => onRemoveItem(path, index)}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium">Image {index + 1}</span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => onMoveUp(index)}
              disabled={isFirst}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => onMoveDown(index)}
              disabled={isLast}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* URL Field */}
        <div className="space-y-1">
          <Label htmlFor={`${path}-${index}-url`} className="text-xs">
            URL
          </Label>
          <div className="flex gap-1">
            <Input
              id={`${path}-${index}-url`}
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="h-8 text-xs"
            />
            <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => openMediaDialog(index)}>
              <ImageIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Alt Text Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${path}-${index}-alt`} className="text-xs">
              Alt Text
            </Label>
            {imageUrl && !generatingAltText && !altText && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs"
                onClick={() => generateAltTextMutation(imageUrl)}
              >
                Generate
              </Button>
            )}
          </div>
          <div className="relative">
            <Input
              id={`${path}-${index}-alt`}
              value={altText}
              onChange={(e) => {
                const newItem = {
                  ...item,
                  alt: e.target.value
                };
                onChange(`${path}[${index}]`, newItem);
              }}
              className="h-8 text-xs"
              placeholder={generatingAltText ? 'Generating alt text...' : 'Describe the image'}
              disabled={generatingAltText}
            />
            {generatingAltText && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
