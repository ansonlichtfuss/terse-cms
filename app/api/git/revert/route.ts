import { NextResponse } from 'next/server';
import { ResetMode } from 'simple-git';

import { createGitInstance } from '@/lib/git';

export async function POST(request: Request) {
  try {
    const git = await createGitInstance(request);

    // Discard all changes
    await git.reset('hard' as ResetMode);
    await git.clean('f', ['-d']);

    return NextResponse.json({
      success: true,
      message: 'Changes reverted'
    });
  } catch (error) {
    console.error('Error reverting changes:', error);
    return NextResponse.json({ error: 'Failed to revert changes' }, { status: 500 });
  }
}
