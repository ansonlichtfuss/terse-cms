import { NextResponse } from 'next/server';

import { FileOperations } from '@/lib/api/files/file-operations';

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
      return NextResponse.json({ error: `Invalid repository ID '${repoId}'.` }, { status: 404 });
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
