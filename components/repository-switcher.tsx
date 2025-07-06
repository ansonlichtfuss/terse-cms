'use client';

import { Check, ChevronDown, Folder } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRepository } from '@/context/repository-context';

export function RepositorySwitcher() {
  const { repositories, currentRepository, currentRepositoryId, isLoading, switchRepository } = useRepository();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-7 text-xs">
        <Folder className="h-3 w-3 mr-1" />
        Loading...
      </Button>
    );
  }

  if (!repositories || repositories.length === 0) {
    return null;
  }

  // Show only if there are multiple repositories
  if (repositories.length === 1) {
    return null;
  }

  const displayLabel = currentRepository?.label || 'Default Repository';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
          <Folder className="h-3 w-3" />
          <span className="max-w-[120px] truncate">{displayLabel}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {/* Default repository option */}
        <DropdownMenuItem onClick={() => switchRepository('default')} className="flex items-center justify-between">
          <div className="flex items-center">
            <Folder className="h-3 w-3 mr-2" />
            <span className="text-xs">Default Repository</span>
          </div>
          {!currentRepositoryId && <Check className="h-3 w-3" />}
        </DropdownMenuItem>

        {/* Repository options */}
        {repositories.map((repo) => (
          <DropdownMenuItem
            key={repo.id}
            onClick={() => switchRepository(repo.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <Folder className="h-3 w-3 mr-2" />
              <span className="text-xs truncate">{repo.label || `Repository ${repo.id}`}</span>
            </div>
            {currentRepositoryId === repo.id && <Check className="h-3 w-3" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
