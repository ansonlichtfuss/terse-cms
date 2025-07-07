'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { ConfigErrorDialog } from '@/components/config-error-dialog';

interface Repository {
  id: string;
  label: string;
}

interface RepositoryContextType {
  repositories: Repository[] | undefined;
  currentRepository: Repository | undefined;
  currentRepositoryId: string | null;
  isLoading: boolean;
  error: Error | null;
  switchRepository: (repositoryId: string) => void;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

const fetchRepositories = async (): Promise<Repository[]> => {
  const response = await fetch('/api/repositories');
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  const data = await response.json();
  return data.repositories;
};

export const RepositoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentRepositoryId, setCurrentRepositoryId] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Fetch repositories using React Query
  const {
    data: repositories,
    isLoading,
    error
  } = useQuery<Repository[], Error>({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
    retry: (failureCount, error) => {
      // Don't retry on configuration errors
      if (failureCount >= 1) {
        setConfigError(error.message);
        return false;
      }
      return failureCount < 3;
    }
  });

  // Get current repository from URL params and auto-fill if needed
  useEffect(() => {
    const repoParam = searchParams.get('repo');

    if (!repoParam && repositories && repositories.length > 0) {
      // Auto-fill with first repository if no repo parameter
      const firstRepo = repositories[0];
      router.replace(`${pathname}?repo=${firstRepo.id}`);
      setCurrentRepositoryId(firstRepo.id);
    } else {
      setCurrentRepositoryId(repoParam);
    }
  }, [searchParams, repositories, router, pathname]);

  // Find current repository object
  const currentRepository = repositories?.find((repo) => repo.id === currentRepositoryId);

  // Handle repository switching
  const switchRepository = (repositoryId: string) => {
    router.push(`${pathname}?repo=${repositoryId}`);
  };

  // Validate repository ID and redirect if invalid
  useEffect(() => {
    if (repositories && currentRepositoryId) {
      const isValidRepo = repositories.some((repo) => repo.id === currentRepositoryId);
      if (!isValidRepo) {
        // Invalid repository ID, redirect to first repository
        const firstRepo = repositories[0];
        router.replace(`${pathname}?repo=${firstRepo.id}`);
      }
    }
  }, [repositories, currentRepositoryId, router, pathname]);

  // Show configuration error dialog if repositories are not configured
  if (configError) {
    return <ConfigErrorDialog error={configError} />;
  }

  const contextValue: RepositoryContextType = {
    repositories,
    currentRepository,
    currentRepositoryId,
    isLoading,
    error,
    switchRepository
  };

  return <RepositoryContext.Provider value={contextValue}>{children}</RepositoryContext.Provider>;
};

export const useRepository = () => {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
};
