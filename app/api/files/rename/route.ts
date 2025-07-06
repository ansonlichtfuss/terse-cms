import { NextResponse } from 'next/server';

import { getFileOperationsForRequest, handleApiError, validateRequiredParam } from '@/lib/api';

interface RenameFileRequest {
  sourcePath: string;
  newName: string;
  type?: 'directory' | 'file';
}

export async function POST(request: Request) {
  try {
    const { sourcePath, newName, type }: RenameFileRequest = await request.json();

    const sourceValidation = validateRequiredParam(sourcePath, 'Source path');
    if (sourceValidation) {
      return sourceValidation;
    }

    const nameValidation = validateRequiredParam(newName, 'New name');
    if (nameValidation) {
      return nameValidation;
    }

    const fileOpsOrError = getFileOperationsForRequest(request);
    if (fileOpsOrError instanceof NextResponse) {
      return fileOpsOrError;
    }

    const result = await fileOpsOrError.renameFile(sourcePath, newName);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'directory' ? 'Folder' : 'File'} renamed`
    });
  } catch (error) {
    return handleApiError(error, 'rename file');
  }
}
