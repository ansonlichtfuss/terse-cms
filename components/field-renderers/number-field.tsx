'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumberFieldProps {
  name: string;
  value: number;
  path: string;
  onChange: (path: string, value: number) => void;
}

export function NumberField({ name, value, path, onChange }: NumberFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={path} className="capitalize text-xs">
        {name}
      </Label>
      <Input
        id={path}
        type="number"
        value={value}
        onChange={(e) => onChange(path, Number(e.target.value))}
        className="h-7 text-xs"
      />
    </div>
  );
}
