import { NextResponse } from 'next/server';

import { createBadRequestResponse, getGitInstanceForRequest, handleApiError } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const gitResult = getGitInstanceForRequest(request);
    if (gitResult.error) {
      return gitResult.error;
    }

    // Dynamically import simple-git only on the server
    const { getGitInstanceForRepository } = await import('@/lib/git');

    const git = getGitInstanceForRepository(gitResult.repoId);

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return createBadRequestResponse('Not a git repository');
    }

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
