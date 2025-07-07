import { NextResponse } from 'next/server';
import { SimpleGit } from 'simple-git';

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

  if (!repoId) {
    return {
      error: NextResponse.json(
        { error: 'Repository ID is required. Please provide a "repo" query parameter.' },
        { status: 400 }
      )
    };
  }

  try {
    const repositories = getRepositoryConfig();
    const repository = repositories.find((r) => r.id === repoId);
    if (!repository) {
      return {
        error: NextResponse.json({ error: `Invalid repository ID '${repoId}'.` }, { status: 404 })
      };
    }
  } catch {
    return {
      error: NextResponse.json(
        {
          error:
            'No repositories configured. Please set environment variables: MARKDOWN_ROOT_DIR_1, MARKDOWN_ROOT_LABEL_1, etc.'
        },
        { status: 500 }
      )
    };
  }

  return { repoId };
}

export async function validateGitRepository(git: SimpleGit): Promise<GitValidationResult> {
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
