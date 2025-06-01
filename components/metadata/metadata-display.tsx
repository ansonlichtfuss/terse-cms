'use client';

import { MetadataItem } from './metadata-item';

interface MetadataDisplayProps {
  frontMatter: Record<string, any>;
  errorMessage?: string | null;
}

export function MetadataDisplay({ frontMatter, errorMessage }: MetadataDisplayProps) {
  return (
    <div className="space-y-4">
      {errorMessage ? (
        <div className="text-xs text-red-800">{errorMessage}</div>
      ) : Object.keys(frontMatter).length === 0 ? (
        <div className="text-xs text-muted-foreground">No metadata found</div>
      ) : (
        Object.entries(frontMatter).map(([key, value]) => <MetadataItem key={key} keyName={key} value={value} />)
      )}
    </div>
  );
}
