"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  name: string;
  value: string;
  path: string;
  onChange: (path: string, value: string) => void;
}

export function TextareaField({
  name,
  value,
  path,
  onChange,
}: TextareaFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={path} className="capitalize text-xs">
        {name}
      </Label>
      <Textarea
        id={path}
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
        rows={4}
        className="text-xs"
      />
    </div>
  );
}
