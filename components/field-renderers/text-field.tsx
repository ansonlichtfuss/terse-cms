"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps {
  name: string;
  value: string;
  path: string;
  onChange: (path: string, value: string) => void;
}

export function TextField({ name, value, path, onChange }: TextFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={path} className="capitalize text-xs">
        {name}
      </Label>
      <Input
        id={path}
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
        className="h-7 text-xs"
      />
    </div>
  );
}
