'use client';

import { getToolbarItems } from '@/components/editor/get-toolbar-items';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorToolbarProps {
  onAction: (action: string, value?: string, textareaRef?: React.RefObject<HTMLTextAreaElement | null>) => void;
  onImageClick: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function EditorToolbar({ onAction, onImageClick, textareaRef }: EditorToolbarProps) {
  const toolbarItems = getToolbarItems(onImageClick);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 p-1 border rounded-md rounded-b-none border-b-0">
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
                      aria-label={item.tooltip}
                      className="h-7 w-7 p-0 hover:bg-white/20 hover:text-primary transition-colors"
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick();
                        } else {
                          onAction(item.action, item.value, textareaRef);
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
  );
}
