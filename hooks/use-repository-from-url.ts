'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { queryKeys } from './api/shared/query-utils';

interface Repository {
  id: string;
  label: string;
}

interface UseRepositoryFromUrlResult {
  repositories: Repository[] | undefined;
  currentRepository: Repository | undefined;
  currentRepositoryId: string | undefined;
  isLoading: boolean;
  error: Error | null;
  switchRepository: (repositoryId: string) => void;
}

const fetchRepositories = async (): Promise<Repository[]> => {
  const response = await fetch('/api/repositories');
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  const data = await response.json();
  return data.repositories;
};

export function useRepositoryFromUrl(): UseRepositoryFromUrlResult {
  const router = useRouter();
  const pathname = usePathname();

  // Handle the case when useSearchParams might not be available during SSR
  const searchParams: URLSearchParams | null = useSearchParams();
  const currentRepositoryId: string | undefined = searchParams?.get('repo') ?? undefined;

  // Fetch repositories using React Query
  const {
    data: repositories,
    isLoading,
    error
  } = useQuery<Repository[], Error>({
    queryKey: queryKeys.repositories(),
    queryFn: fetchRepositories,
    retry: (failureCount) => {
      // Don't retry on configuration errors
      if (failureCount >= 1) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Auto-fill with first repository if no repo parameter
  useEffect(() => {
    if (!currentRepositoryId && repositories && repositories.length > 0) {
      const firstRepo = repositories[0];
      router.replace(`${pathname}?repo=${firstRepo.id}`);
    }
  }, [currentRepositoryId, repositories, router, pathname]);

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

  // Find current repository object
  const currentRepository = repositories?.find((repo) => repo.id === currentRepositoryId);

  // Handle repository switching
  const switchRepository = (repositoryId: string) => {
    router.push(`${pathname}?repo=${repositoryId}`);
  };

  return {
    repositories,
    currentRepository,
    currentRepositoryId,
    isLoading,
    error,
    switchRepository
  };
}
