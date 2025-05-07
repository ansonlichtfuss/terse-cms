"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FileIcon, CheckIcon, XIcon } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

interface MetadataPreviewProps {
  frontMatter: any;
}

export function MetadataPreview({ frontMatter }: MetadataPreviewProps) {
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, "PPP");
      }
    } catch (e) {
      // Not a valid date string
    }
    return dateString;
  };

  // Helper to determine if a value is an image URL
  const isImageUrl = (value: string) => {
    return (
      typeof value === "string" &&
      (/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/.test(value) ||
        value.includes("media") ||
        value.includes("image"))
    );
  };

  // Helper to check if an array contains image objects
  const isImageArray = (arr: any[]) => {
    if (arr.length === 0 || typeof arr[0] !== "object") return false;

    // Check if objects have image-related properties
    const imageProps = ["image", "url", "src", "source", "thumbnail"];
    return arr.some((item) => {
      return Object.keys(item).some(
        (key) =>
          imageProps.includes(key.toLowerCase()) ||
          (typeof item[key] === "string" && isImageUrl(item[key]))
      );
    });
  };

  // Render different types of values
  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined) {
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
      try {
        const date = parseISO(value);
        if (isValid(date) && value.includes("T")) {
          return (
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>{formatDate(value)}</span>
            </div>
          );
        }
      } catch (e) {
        // Not a valid date string
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
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {value}
            </span>
          </div>
        );
      }

      // Regular string
      return <span className="truncate">{value}</span>;
    }

    if (Array.isArray(value)) {
      if (isImageArray(value)) {
        return (
          <div className="grid grid-cols-3 gap-2">
            {value.map((item, index) => {
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
                  <span className="text-xs text-muted-foreground truncate">
                    {alt}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      return <Badge>{value.length} items</Badge>;
    }

    if (typeof value === "object") {
      return <Badge>Object</Badge>;
    }

    return <span>{String(value)}</span>;
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-3">
        <div className="max-h-[200px] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(frontMatter).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center gap-1">
                  <FileIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium capitalize">{key}</span>
                </div>
                <div className="text-xs">{renderValue(key, value)}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
