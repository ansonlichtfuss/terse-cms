"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Code,
  Quote,
  Undo,
  Redo,
} from "lucide-react"

interface EditorToolbarProps {
  onAction: (action: string, value?: string) => void
  onImageClick: () => void
}

export function EditorToolbar({ onAction, onImageClick }: EditorToolbarProps) {
  const toolbarItems = [
    {
      group: "headings",
      items: [
        { icon: <Heading1 className="h-4 w-4" />, action: "heading", value: "# ", tooltip: "Heading 1" },
        { icon: <Heading2 className="h-4 w-4" />, action: "heading", value: "## ", tooltip: "Heading 2" },
        { icon: <Heading3 className="h-4 w-4" />, action: "heading", value: "### ", tooltip: "Heading 3" },
      ],
    },
    {
      group: "formatting",
      items: [
        { icon: <Bold className="h-4 w-4" />, action: "bold", tooltip: "Bold" },
        { icon: <Italic className="h-4 w-4" />, action: "italic", tooltip: "Italic" },
      ],
    },
    {
      group: "lists",
      items: [
        { icon: <List className="h-4 w-4" />, action: "list", tooltip: "Bullet List" },
        { icon: <ListOrdered className="h-4 w-4" />, action: "ordered-list", tooltip: "Numbered List" },
      ],
    },
    {
      group: "elements",
      items: [
        { icon: <Link className="h-4 w-4" />, action: "link", tooltip: "Insert Link" },
        { icon: <ImageIcon className="h-4 w-4" />, action: "image", tooltip: "Insert Image", onClick: onImageClick },
        { icon: <Code className="h-4 w-4" />, action: "code", tooltip: "Code Block" },
        { icon: <Quote className="h-4 w-4" />, action: "quote", tooltip: "Blockquote" },
      ],
    },
    {
      group: "history",
      items: [
        { icon: <Undo className="h-4 w-4" />, action: "undo", tooltip: "Undo" },
        { icon: <Redo className="h-4 w-4" />, action: "redo", tooltip: "Redo" },
      ],
    },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 p-1 border rounded-md bg-muted/50">
        {toolbarItems.map((group, groupIndex) => (
          <div key={group.group} className="flex items-center">
            {groupIndex > 0 && <Separator orientation="vertical" className="mx-1 h-6" />}
            <div className="flex items-center gap-1">
              {group.items.map((item) => (
                <Tooltip key={item.tooltip}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick()
                        } else {
                          onAction(item.action, item.value)
                        }
                      }}
                    >
                      {item.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {item.tooltip}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
