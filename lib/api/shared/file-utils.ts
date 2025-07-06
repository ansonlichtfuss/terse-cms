import { NextResponse } from 'next/server';

import { FileOperations } from '@/lib/api/files/file-operations';
import { getRepositoryConfig } from '@/lib/paths';

export function getFileOperationsForRequest(request: Request): FileOperations | NextResponse {
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get('repo');

  if (repoId) {
    try {
      return new FileOperations(repoId);
    } catch {
      const repositories = getRepositoryConfig();
      const availableIds = repositories.map((r) => r.id).join(', ');
      return NextResponse.json(
        { error: `Invalid repository ID '${repoId}'. Available repositories: ${availableIds}` },
        { status: 404 }
      );
    }
  }

  return new FileOperations();
}
