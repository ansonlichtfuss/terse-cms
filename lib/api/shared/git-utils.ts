import { NextResponse } from 'next/server';

import { getRepositoryConfig } from '@/lib/paths';

export interface GitInstanceResult {
  repoId?: string;
  error?: NextResponse;
}

export interface GitValidationResult {
  isValid: boolean;
  error?: NextResponse;
}

export function getGitInstanceForRequest(request: Request): GitInstanceResult {
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get('repo');

  if (repoId) {
    try {
      const repositories = getRepositoryConfig();
      const repository = repositories.find((r) => r.id === repoId);
      if (!repository) {
        const availableIds = repositories.map((r) => r.id).join(', ');
        return {
          error: NextResponse.json(
            { error: `Invalid repository ID '${repoId}'. Available repositories: ${availableIds}` },
            { status: 404 }
          )
        };
      }
    } catch {
      return {
        error: NextResponse.json({ error: 'Failed to validate repository configuration' }, { status: 500 })
      };
    }
  }

  return { repoId: repoId || undefined };
}

export async function validateGitRepository(git: any): Promise<GitValidationResult> {
  try {
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return {
        isValid: false,
        error: NextResponse.json({ error: 'Not a git repository' }, { status: 400 })
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: NextResponse.json({ error: 'Failed to validate git repository' }, { status: 500 })
    };
  }
}
