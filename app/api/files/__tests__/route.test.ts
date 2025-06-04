// app/api/files/__tests__/route.test.ts
import { NextRequest } from 'next/server';

import { GET } from '../route'; // Import the GET handler directly

describe('/api/files GET', () => {
  it('should return a list of files', async () => {
    // Mock the request object
    const request = new NextRequest('http://localhost/api/files?path=README.md');

    // Call the GET handler directly
    const response = await GET(request);

    // Assert the response status and body
    expect(response.status).toBe(200);
    const jsonResponse = await response.json();
    expect(jsonResponse).toHaveProperty('path');
    expect(jsonResponse).toHaveProperty('content');
    expect(jsonResponse.path).toBe('README.md');
    expect(jsonResponse.content).toContain('This is my website built with Next.js and Markdown.');
  });

  it('should return 400 if path parameter is missing', async () => {
    const request = new NextRequest('http://localhost/api/files');
    const response = await GET(request);
    expect(response.status).toBe(400);
    const jsonResponse = await response.json();
    expect(jsonResponse).toHaveProperty('error', 'Path parameter is required');
  });

  it('should return 404 if file not found in mock filesystem', async () => {
    const request = new NextRequest('http://localhost/api/files?path=nonexistent-file.md');
    const response = await GET(request);
    expect(response.status).toBe(404);
    const jsonResponse = await response.json();
    expect(jsonResponse).toHaveProperty('error', 'File not found in mock filesystem');
  });
});
