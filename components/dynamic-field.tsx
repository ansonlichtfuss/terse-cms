'use client';

import { ChevronDown, ChevronRight, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

import { BooleanField } from '@/components/field-renderers/boolean-field';
import { DateField } from '@/components/field-renderers/date-field';
import { ImageField } from '@/components/field-renderers/image-field';
import { NumberField } from '@/components/field-renderers/number-field';
import { TextField } from '@/components/field-renderers/text-field';
import { TextareaField } from '@/components/field-renderers/textarea-field';
import { ImageArrayField } from '@/components/image-array-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import type { DynamicFieldProps } from '@/types';
import { isDateString } from '@/utils/date-utils';
import { isImageArray, isImageUrl } from '@/utils/media-utils';

export function DynamicField({
  name,
  value,
  path = name,
  onChange,
  onAddItem,
  onRemoveItem,
  level = 0
}: DynamicFieldProps) {
  const [isOpen, setIsOpen] = useState(level < 1);

  // Determine the field type
  const getFieldType = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      // Check if it's a date string
      if (isDateString(value)) {
        return 'date';
      }

      // Check if it's an image URL
      if (isImageUrl(value)) {
        return 'image';
      }

      // Check if it's a multiline string
      if (value.includes('\n')) {
        return 'textarea';
      }

      return 'string';
    }
    if (Array.isArray(value)) {
      // Check if it's an array of image objects
      if (value.length > 0 && typeof value[0] === 'object' && isImageArray(value)) {
        return 'image-array';
      }
      return 'array';
    }
    if (typeof value === 'object') return 'object';
    return 'string'; // Default
  };

  // Custom function to add a new image item with only url and alt fields
  const handleAddImageItem = (path: string) => {
    const newItem = {
      url: '',
      alt: ''
    };

    if (onAddItem) {
      // Override the default onAddItem behavior for image arrays
      const currentValue = Array.isArray(value) ? [...value] : [];
      onChange(path, [...currentValue, newItem]);
    }
  };

  const fieldType = getFieldType(value);

  // Render field based on type
  const renderField = () => {
    switch (fieldType) {
      case 'boolean':
        return <BooleanField name={name} value={value} path={path} onChange={onChange} />;

      case 'number':
        return <NumberField name={name} value={value} path={path} onChange={onChange} />;

      case 'date':
        return <DateField name={name} value={value} path={path} onChange={onChange} />;

      case 'image':
        return <ImageField name={name} value={value} path={path} onChange={onChange} />;

      case 'textarea':
        return <TextareaField name={name} value={value} path={path} onChange={onChange} />;

      case 'image-array':
        return (
          <ImageArrayField
            name={name}
            value={value}
            path={path}
            onChange={onChange}
            onAddItem={handleAddImageItem}
            onRemoveItem={onRemoveItem!}
          />
        );

      case 'array':
        return (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                  {isOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                  <Label className="capitalize cursor-pointer text-xs">{name}</Label>
                </Button>
              </CollapsibleTrigger>
              {onAddItem && (
                <Button variant="outline" size="sm" onClick={() => onAddItem(path)} className="h-6 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              )}
            </div>
            <CollapsibleContent className="space-y-2">
              {value.map((item: any, index: number) => (
                <Card key={index} className="border">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-xs font-medium">Item {index + 1}</Label>
                      {onRemoveItem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveItem(path, index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {typeof item === 'object' && item !== null ? (
                      // If array contains objects, render each property
                      Object.entries(item).map(([key, val]) => (
                        <div key={key} className="mt-2">
                          <DynamicField
                            name={key}
                            value={val}
                            path={`${path}[${index}].${key}`}
                            onChange={onChange}
                            level={level + 1}
                          />
                        </div>
                      ))
                    ) : (
                      // If array contains primitive values
                      <TextField
                        name={`Item ${index + 1}`}
                        value={item}
                        path={`${path}[${index}]`}
                        onChange={(_, newValue) => {
                          const newArray = [...value];
                          newArray[index] = newValue;
                          onChange(path, newArray);
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        );

      case 'object':
        return (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                {isOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                <Label className="capitalize cursor-pointer text-xs">{name}</Label>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pl-4 border-l">
              {Object.entries(value).map(([key, val]) => (
                <DynamicField
                  key={key}
                  name={key}
                  value={val}
                  path={`${path}.${key}`}
                  onChange={onChange}
                  onAddItem={onAddItem}
                  onRemoveItem={onRemoveItem}
                  level={level + 1}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        );

      case 'null':
        return <TextField name={name} value="" path={path} onChange={onChange} />;

      default:
        return <TextField name={name} value={value} path={path} onChange={onChange} />;
    }
  };

  return <div className="space-y-2">{renderField()}</div>;
}
