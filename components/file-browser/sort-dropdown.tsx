import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { SortConfig, SortField } from './types/sorting';

interface SortDropdownProps {
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  type: 'files' | 'media';
  className?: string;
}

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'lastModified', label: 'Date Modified' }
];

export function SortDropdown({ sortConfig, onSortChange, type: _type, className }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFieldChange = (value: string) => {
    onSortChange?.({ ...sortConfig, field: value as SortField });
  };

  const handleSortChange = (field: SortField, direction: 'asc' | 'desc') => {
    onSortChange?.({ ...sortConfig, field, direction });
  };

  const handleFoldersFirstChange = (foldersFirst: boolean) => {
    onSortChange?.({ ...sortConfig, foldersFirst });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-7 w-7 ${className || ''}`}
              aria-label="Sort options"
              aria-expanded={isOpen}
              aria-haspopup="menu"
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Sort Options</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-56" role="menu" aria-label="Sort options menu">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>

        <DropdownMenuRadioGroup value={sortConfig.field} onValueChange={handleFieldChange} className="list-none">
          {SORT_FIELDS.map(({ value, label }) => (
            <DropdownMenuRadioItem key={value} value={value} className="flex items-center justify-between">
              <span>{label}</span>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant={sortConfig.field === value && sortConfig.direction === 'asc' ? 'default' : 'ghost'}
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSortChange(value as SortField, 'asc');
                  }}
                  aria-label={`Sort ${label.toLowerCase()} ascending`}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={sortConfig.field === value && sortConfig.direction === 'desc' ? 'default' : 'ghost'}
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSortChange(value as SortField, 'desc');
                  }}
                  aria-label={`Sort ${label.toLowerCase()} descending`}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={sortConfig.foldersFirst}
          onCheckedChange={handleFoldersFirstChange}
          aria-describedby="folders-first-desc"
        >
          Show folders first
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
