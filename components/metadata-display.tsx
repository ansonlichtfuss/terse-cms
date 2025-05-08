"use client";

import { FileIcon, CalendarIcon, CheckIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isImageUrl, isImageArray } from "@/utils/media-utils";
import { formatDate, isDateString } from "@/utils/date-utils";

interface MetadataDisplayProps {
  frontMatter: Record<string, any>;
}

export function MetadataDisplay({ frontMatter }: MetadataDisplayProps) {
  // Helper function to check if a value is a date object
  const isDateObject = (value: any): boolean => {
    return (
      value instanceof Date ||
      (typeof value === "object" &&
        value !== null &&
        typeof value.toISOString === "function")
    );
  };

  // Render different types of values
  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Empty</span>;
    }

    if (typeof value === "boolean") {
      return value ? (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckIcon className="h-3 w-3 mr-1" /> True
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          <XIcon className="h-3 w-3 mr-1" /> False
        </Badge>
      );
    }

    if (typeof value === "string") {
      // Check if it's a date
      if (isDateString(value)) {
        return (
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{formatDate(value)}</span>
          </div>
        );
      }

      // Check if it's an image URL
      if (isImageUrl(value)) {
        return (
          <div className="flex flex-col gap-1">
            <div className="relative aspect-video w-full max-w-[120px] bg-muted rounded-md overflow-hidden">
              <img
                src={value || "/placeholder.svg"}
                alt={key}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=100&width=120";
                }}
              />
            </div>
          </div>
        );
      }

      // Regular string - truncate if too long
      // Regular string - allow wrapping
      return <span>{value}</span>;
    }

    // Handle date objects
    if (isDateObject(value)) {
      try {
        return (
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{formatDate(value.toISOString())}</span>
          </div>
        );
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }

    if (Array.isArray(value)) {
      if (value.length === 0)
        return (
          <span className="text-muted-foreground italic">Empty array</span>
        );

      if (isImageArray(value)) {
        return (
          <div className="grid grid-cols-2 gap-2">
            {value.slice(0, 4).map((item, index) => {
              const imageUrl = item.url || item.src || item.image || "";
              const alt = item.alt || `Image ${index + 1}`;

              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/placeholder.svg?height=60&width=80";
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {value.length > 4 && (
              <Badge variant="outline" className="mt-1">
                +{value.length - 4} more
              </Badge>
            )}
          </div>
        );
      }

      return <Badge>{value.length} items</Badge>;
    }

    if (typeof value === "object" && value !== null) {
      // Try to stringify the object for display
      try {
        return (
          <span className="text-xs font-mono">{JSON.stringify(value)}</span>
        );
      } catch (e) {
        return <Badge>Object</Badge>;
      }
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="space-y-4">
      {Object.keys(frontMatter).length === 0 ? (
        <div className="text-xs text-muted-foreground">No metadata found</div>
      ) : (
        Object.entries(frontMatter).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center gap-1">
              {/* Only show icons for special types */}
              {typeof value === "string" && isDateString(value) && (
                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              )}
              {typeof value === "string" && isImageUrl(value) && (
                <FileIcon className="h-3 w-3 text-muted-foreground" />
              )}
              {Array.isArray(value) && isImageArray(value) && (
                <FileIcon className="h-3 w-3 text-muted-foreground" />
              )}
              {isDateObject(value) && (
                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="text-xs font-medium capitalize">{key}</span>
            </div>
            <div className="text-xs">{renderValue(key, value)}</div>
          </div>
        ))
      )}
    </div>
  );
}
