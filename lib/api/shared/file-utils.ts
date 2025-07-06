import { NextResponse } from 'next/server';

import { FileOperations } from '@/lib/api/files/file-operations';
import { getRepositoryConfig } from '@/lib/paths';

export function getFileOperationsForRequest(request: Request): FileOperations | NextResponse {
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get('repo');

  if (!repoId) {
    return NextResponse.json(
      { error: 'Repository ID is required. Please provide a "repo" query parameter.' },
      { status: 400 }
    );
  }

  try {
    return new FileOperations(repoId);
  } catch {
    try {
      const repositories = getRepositoryConfig();
      const availableIds = repositories.map((r) => r.id).join(', ');
      return NextResponse.json(
        { error: `Invalid repository ID '${repoId}'. Available repositories: ${availableIds}` },
        { status: 404 }
      );
    } catch {
      return NextResponse.json(
        {
          error:
            'No repositories configured. Please set environment variables: MARKDOWN_ROOT_DIR_1, MARKDOWN_ROOT_LABEL_1, etc.'
        },
        { status: 500 }
      );
    }
  }
}
