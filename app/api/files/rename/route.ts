import { NextResponse } from 'next/server';

import { FileOperations } from '@/lib/file-operations';

interface RenameFileRequest {
  sourcePath: string;
  newName: string;
  type?: 'directory' | 'file';
}

export async function POST(request: Request) {
  try {
    const { sourcePath, newName, type }: RenameFileRequest = await request.json();

    if (!sourcePath) {
      return NextResponse.json({ error: 'Source path is required' }, { status: 400 });
    }

    if (!newName) {
      return NextResponse.json({ error: 'New name is required' }, { status: 400 });
    }

    const fileOps = new FileOperations();
    const result = await fileOps.renameFile(sourcePath, newName);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'directory' ? 'Folder' : 'File'} renamed`
    });
  } catch (error) {
    console.error('Error renaming file:', error);
    return NextResponse.json({ error: 'Failed to rename file' }, { status: 500 });
  }
}
