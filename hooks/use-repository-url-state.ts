'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useRepositoryUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRepositoryId = searchParams.get('repo');

  const setRepositoryId = useCallback(
    (repositoryId: string | null) => {
      const url = new URL(window.location.href);

      if (repositoryId && repositoryId !== 'default') {
        url.searchParams.set('repo', repositoryId);
      } else {
        url.searchParams.delete('repo');
      }

      router.push(url.pathname + url.search);
    },
    [router]
  );

  const getApiUrl = useCallback(
    (baseUrl: string, additionalParams?: Record<string, string>) => {
      const url = new URL(baseUrl, window.location.origin);

      // Add repository parameter if present
      if (currentRepositoryId) {
        url.searchParams.set('repo', currentRepositoryId);
      }

      // Add any additional parameters
      if (additionalParams) {
        Object.entries(additionalParams).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      return url.toString();
    },
    [currentRepositoryId]
  );

  return {
    currentRepositoryId,
    setRepositoryId,
    getApiUrl
  };
}
