'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Repository {
  id: string;
  label: string;
  path: string;
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

  // Fetch repositories using React Query
  const {
    data: repositories,
    isLoading,
    error
  } = useQuery<Repository[], Error>({
    queryKey: ['repositories'],
    queryFn: fetchRepositories
  });

  // Get current repository from URL params
  useEffect(() => {
    const repoParam = searchParams.get('repo');
    setCurrentRepositoryId(repoParam);
  }, [searchParams]);

  // Find current repository object
  const currentRepository = repositories?.find((repo) => repo.id === currentRepositoryId);

  // Handle repository switching
  const switchRepository = (repositoryId: string) => {
    if (repositoryId && repositoryId !== 'default') {
      router.push(`${pathname}?repo=${repositoryId}`);
    } else {
      router.push(pathname);
    }
  };

  // Validate repository ID and redirect if invalid
  useEffect(() => {
    if (repositories && currentRepositoryId) {
      const isValidRepo = repositories.some((repo) => repo.id === currentRepositoryId);
      if (!isValidRepo) {
        // Invalid repository ID, redirect to default (no repo param)
        router.replace(pathname);
      }
    }
  }, [repositories, currentRepositoryId, router, pathname]);

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
