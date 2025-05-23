'use client';

import { MetadataItem } from './metadataItem';

interface MetadataDisplayProps {
  frontMatter: Record<string, any>;
}

export function MetadataDisplay({ frontMatter }: MetadataDisplayProps) {
  return (
    <div className="space-y-4">
      {Object.keys(frontMatter).length === 0 ? (
        <div className="text-xs text-muted-foreground">No metadata found</div>
      ) : (
        Object.entries(frontMatter).map(([key, value]) => <MetadataItem key={key} keyName={key} value={value} />)
      )}
    </div>
  );
}
