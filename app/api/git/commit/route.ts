import { NextResponse } from 'next/server';

import { createBadRequestResponse, getGitInstanceForRequest, handleApiError, validateRequiredParam } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const messageValidation = validateRequiredParam(message, 'Commit message');
    if (messageValidation) {
      return messageValidation;
    }

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

    // Add all changes
    await git.add('.');

    // Commit changes
    const commitResult = await git.commit(message);

    return NextResponse.json({
      success: true,
      commit: commitResult
    });
  } catch (error) {
    return handleApiError(error, 'commit changes');
  }
}
