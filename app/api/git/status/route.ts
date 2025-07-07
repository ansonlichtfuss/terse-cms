import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api';
import { createGitInstance } from '@/lib/git';

export async function GET(request: Request) {
  try {
    const git = await createGitInstance(request);

    // Get status
    const status = await git.status();

    // Get modified files
    const modifiedFiles = [
      ...status.modified,
      ...status.not_added,
      ...status.created,
      ...status.deleted,
      ...status.renamed.map((file) => file.to)
    ];

    return NextResponse.json({
      modifiedFiles,
      isClean: status.isClean()
    });
  } catch (error) {
    return handleApiError(error, 'get git status');
  }
}
