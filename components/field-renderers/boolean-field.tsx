'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BooleanFieldProps {
  name: string;
  value: boolean;
  path: string;
  onChange: (path: string, value: boolean) => void;
}

export function BooleanField({ name, value, path, onChange }: BooleanFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <Checkbox id={path} checked={value} onCheckedChange={(checked) => onChange(path, !!checked)} />
        <Label htmlFor={path} className="capitalize">
          {name}
        </Label>
      </div>
    </div>
  );
}
