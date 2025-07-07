import { NextResponse } from 'next/server';

import { handleApiError, validateRequiredParam } from '@/lib/api';
import { createGitInstance } from '@/lib/git';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const messageValidation = validateRequiredParam(message, 'Commit message');
    if (messageValidation) {
      return messageValidation;
    }

    const git = await createGitInstance(request);

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
