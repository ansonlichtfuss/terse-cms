import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleApiError(error: any, operation: string): NextResponse {
  console.error(`Error ${operation}:`, error);
  return NextResponse.json({ error: `Failed to ${operation}` }, { status: error?.statusCode ?? 500 });
}

export function validateRequiredParam(param: string | null, paramName: string): NextResponse | null {
  if (!param) {
    return NextResponse.json({ error: `${paramName} is required` }, { status: 400 });
  }
  return null;
}

export function createSuccessResponse(message?: string): NextResponse {
  const response: { success: true; message?: string } = { success: true };
  if (message) {
    response.message = message;
  }
  return NextResponse.json(response);
}

export function createNotFoundResponse(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function createBadRequestResponse(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}
