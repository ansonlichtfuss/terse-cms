"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MetadataItem } from "./metadataItem";

interface MetadataPreviewProps {
  frontMatter: any;
}

export function MetadataPreview({ frontMatter }: MetadataPreviewProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-3">
        <div className="max-h-[200px] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(frontMatter).map(([key, value]) => (
              <MetadataItem key={key} keyName={key} value={value} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
