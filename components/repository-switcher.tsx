'use client';

import { Check, ChevronDown, Library } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRepository } from '@/context/repository-context';

export function RepositorySwitcher() {
  const { repositories, currentRepository, currentRepositoryId, isLoading, switchRepository } = useRepository();
  const pathname = usePathname();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRepositoryId, setPendingRepositoryId] = useState<string | null>(null);

  const isNotBaseUrl = pathname !== '/';

  const handleRepositorySwitch = (repositoryId: string) => {
    if (isNotBaseUrl) {
      // Show confirmation dialog if not on base URL
      setPendingRepositoryId(repositoryId);
      setShowConfirmDialog(true);
    } else {
      // Directly switch if on base URL
      switchRepository(repositoryId);
    }
  };

  const confirmSwitch = () => {
    if (pendingRepositoryId) {
      // Redirect to base URL with new repository
      window.location.href = `/?repo=${pendingRepositoryId}`;
    }
    setShowConfirmDialog(false);
    setPendingRepositoryId(null);
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-7 text-xs">
        <Library className="h-3 w-3 mr-1" />
        Loading...
      </Button>
    );
  }

  if (!repositories || repositories.length === 0) {
    return null;
  }

  if (repositories.length === 1) {
    return null;
  }

  const displayLabel = currentRepository?.label;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <Library className="h-3 w-3" />
            <span className="max-w-[120px] truncate">{displayLabel}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {/* Repository options */}
          {repositories.map((repo) => (
            <DropdownMenuItem
              key={repo.id}
              disabled={repo.id === currentRepository?.id}
              onClick={() => handleRepositorySwitch(repo.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="text-xs truncate">{repo.label || `Repository ${repo.id}`}</span>
              </div>
              {currentRepositoryId === repo.id && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Switch Repository"
        description="You are currently viewing a file. Switching repositories will redirect you to the home page and any unsaved changes might be lost."
        confirmLabel="Switch Repository"
        cancelLabel="Cancel"
        onConfirm={confirmSwitch}
        destructive={false}
        isDeleting={false}
      />
    </>
  );
}
