import { NextResponse } from 'next/server';

import { getFileOperationsForRequest, handleApiError, validateRequiredParam } from '@/lib/api';

interface MoveFileRequest {
  sourcePath: string;
  destinationPath: string;
  type?: 'directory' | 'file';
}

export async function POST(request: Request) {
  try {
    const { sourcePath, destinationPath, type }: MoveFileRequest = await request.json();

    const sourceValidation = validateRequiredParam(sourcePath, 'Source path');
    if (sourceValidation) {
      return sourceValidation;
    }

    const destValidation = validateRequiredParam(destinationPath, 'Destination path');
    if (destValidation) {
      return destValidation;
    }

    const fileOpsOrError = getFileOperationsForRequest(request);
    if (fileOpsOrError instanceof NextResponse) {
      return fileOpsOrError;
    }

    const result = await fileOpsOrError.moveFile(sourcePath, destinationPath);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'directory' ? 'Folder' : 'File'} moved`
    });
  } catch (error) {
    return handleApiError(error, 'move file');
  }
}
