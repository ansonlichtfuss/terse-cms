import { NextResponse } from 'next/server';

import { FileOperations } from '@/lib/api/files/file-operations';

interface MoveFileRequest {
  sourcePath: string;
  destinationPath: string;
  type?: 'directory' | 'file';
}

export async function POST(request: Request) {
  try {
    const { sourcePath, destinationPath, type }: MoveFileRequest = await request.json();

    if (!sourcePath) {
      return NextResponse.json({ error: 'Source path is required' }, { status: 400 });
    }

    if (!destinationPath) {
      return NextResponse.json({ error: 'Destination path is required' }, { status: 400 });
    }

    const fileOps = new FileOperations();
    const result = await fileOps.moveFile(sourcePath, destinationPath);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'directory' ? 'Folder' : 'File'} moved`
    });
  } catch (error) {
    console.error('Error moving file:', error);
    return NextResponse.json({ error: 'Failed to move file' }, { status: 500 });
  }
}
