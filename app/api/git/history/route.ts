import { NextResponse } from 'next/server';

import { getGitInstance } from '@/lib/git';

const git = getGitInstance();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json({ error: 'filePath parameter is required' }, { status: 400 });
    }

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json({ error: 'Not a git repository' }, { status: 400 });
    }

    // Get commit history for the specific file
    // Construct the full path relative to the baseDir
    const fullPath = filePath;
    const log = await git.log({ file: fullPath });

    const commits = await Promise.all(
      log.all.map(async (commit) => {
        let insertions = 0;
        let deletions = 0;
        let totalFilesChanged = 0;

        try {
          // Use git show to get detailed stats for the file in this commit
          const showOutput = await git.show([commit.hash, '--stat=1000', '--oneline', '--', fullPath]);
          const lines = showOutput.split('\n').map((line) => line.trim());

          console.log('Git show output:', showOutput);

          // Parse the summary line for insertions and deletions
          const summaryLine = lines.find((line) => line.includes('insertions(+)'));
          if (summaryLine) {
            const insertionMatch = summaryLine.match(/(\d+) insertions\(\+\)/);
            const deletionMatch = summaryLine.match(/(\d+) deletions\(\-\)/);
            if (insertionMatch && insertionMatch[1]) {
              insertions = parseInt(insertionMatch[1], 10);
            }
            if (deletionMatch && deletionMatch[1]) {
              deletions = parseInt(deletionMatch[1], 10);
            }
          }

          // Find the line with the total files changed
          const totalFilesLine = lines.find((line) => line.includes('changed') && line.match(/\d+/));
          if (totalFilesLine) {
            const totalFilesMatch = totalFilesLine.match(/(\d+) file changed/);
            if (totalFilesMatch && totalFilesMatch[1]) {
              totalFilesChanged = parseInt(totalFilesMatch[1], 10);
            }
          }
        } catch (showError) {
          console.error(`Error fetching stats for commit ${commit.hash}:`, showError);
          // Keep insertions and deletions and totalFilesChanged as 0 in case of error
        }

        return {
          hash: commit.hash,
          message: commit.message,
          author: commit.author_name,
          date: commit.date,
          changes: {
            files: [], // Still a placeholder
            insertions,
            deletions,
            totalFilesChanged
          }
        };
      })
    );

    return NextResponse.json(commits);
  } catch (error) {
    console.error('Error fetching git history:', error);
    return NextResponse.json({ error: 'Failed to fetch git history' }, { status: 500 });
  }
}
