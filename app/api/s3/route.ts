import { NextResponse } from 'next/server';

import { shouldUseMockApi } from '@/lib/env';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';

  // Always use mock data in browser or if mock mode is enabled
  const useMock = shouldUseMockApi();

  if (useMock) {
    // Dynamically import Node.js modules only on the server
    const fs = await import('fs');

    const MOCK_S3_FILE = 'mock-data/s3-items.json';

    try {
      const s3Data = JSON.parse(fs.readFileSync(MOCK_S3_FILE, 'utf8'));
      const mockItems = s3Data[path] || [];
      return NextResponse.json({
        items: mockItems
      });
    } catch (error) {
      console.error('Error reading mock S3 data:', error);
      return NextResponse.json({ error: 'Failed to read mock S3 data' }, { status: 500 });
    }
  }

  try {
    // Dynamically import AWS SDK only on the server
    const AWS = await import('@aws-sdk/client-s3');
    const S3Client = AWS.S3Client;
    const ListObjectsV2Command = AWS.ListObjectsV2Command;

    // Get S3 configuration from environment variables
    const S3_BUCKET = process.env.S3_BUCKET || '';
    const S3_REGION = process.env.S3_REGION || 'us-east-1';
    const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
    const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';

    // Create S3 client
    const s3Client = new S3Client({
      region: S3_REGION.startsWith('http') ? 'us-east-1' : S3_REGION, // Use a default region if a custom endpoint is provided
      endpoint: S3_REGION.startsWith('http') ? S3_REGION : undefined, // Use endpoint if S3_REGION is a URL
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY
      }
    });

    // List objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: path,
      Delimiter: '/'
    });

    const response = await s3Client.send(command);

    // Process folders (CommonPrefixes)
    const folders = (response.CommonPrefixes || []).map((prefix) => ({
      key: prefix.Prefix || '',
      type: 'folder'
    }));

    // Process files (Contents)
    const files = (response.Contents || [])
      .filter((item) => item.Key !== path) // Filter out the current directory
      .map((item) => ({
        key: item.Key || '',
        type: 'file',
        size: item.Size,
        lastModified: item.LastModified?.toISOString(),
        url: item.Key
          ? item.Key.endsWith('/')
            ? `${process.env.S3_FOLDER_URL_BASE || (S3_REGION.startsWith('http') ? `${S3_REGION}/${S3_BUCKET}/` : `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`)}${item.Key}`
            : `${process.env.S3_FILE_URL_BASE || (S3_REGION.startsWith('http') ? `${S3_REGION}/${S3_BUCKET}/` : `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`)}${item.Key}`
          : ''
      }));

    return NextResponse.json({
      items: [...folders, ...files]
    });
  } catch (error) {
    console.error('Error listing S3 objects:', error);
    return NextResponse.json({ error: 'Failed to list S3 objects' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock = shouldUseMockApi();

  if (useMock) {
    // Dynamically import Node.js modules only on the server
    const fs = await import('fs');
    const pathModule = await import('path');

    const MOCK_S3_FILE = 'mock-data/s3-items.json';

    try {
      const s3Data = JSON.parse(fs.readFileSync(MOCK_S3_FILE, 'utf8'));
      const { key, type } = await request.json();

      if (type === 'file') {
        // Find the parent folder key
        const parentFolder = pathModule.dirname(key);
        if (s3Data[parentFolder]) {
          s3Data[parentFolder] = s3Data[parentFolder].filter((item: { key: string }) => item.key !== key);
        }
      } else if (type === 'folder') {
        // Remove the folder and all items within it
        const folderKey = key.endsWith('/') ? key : key + '/';
        delete s3Data[folderKey];
        for (const dataKey in s3Data) {
          if (dataKey.startsWith(folderKey)) {
            delete s3Data[dataKey];
          } else {
            s3Data[dataKey] = s3Data[dataKey].filter((item: { key: string }) => !item.key.startsWith(folderKey));
          }
        }
      }

      fs.writeFileSync(MOCK_S3_FILE, JSON.stringify(s3Data, null, 2), 'utf8');

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting mock S3 object:', error);
      return NextResponse.json({ error: 'Failed to delete mock S3 object' }, { status: 500 });
    }
  }

  try {
    // Dynamically import AWS SDK only on the server
    const AWS = await import('@aws-sdk/client-s3');
    const S3Client = AWS.S3Client;
    const DeleteObjectCommand = AWS.DeleteObjectCommand;
    const DeleteObjectsCommand = AWS.DeleteObjectsCommand;
    const ListObjectsV2Command = AWS.ListObjectsV2Command;

    // Get S3 configuration from environment variables
    const S3_BUCKET = process.env.S3_BUCKET || '';
    const S3_REGION = process.env.S3_REGION || 'us-east-1';
    const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
    const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';

    // Create S3 client
    const s3Client = new S3Client({
      region: S3_REGION.startsWith('http') ? 'us-east-1' : S3_REGION, // Use a default region if a custom endpoint is provided
      endpoint: S3_REGION.startsWith('http') ? S3_REGION : undefined, // Use endpoint if S3_REGION is a URL
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY
      }
    });

    const { key, type } = await request.json();

    if (type === 'file') {
      // Delete a single file
      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key
      });

      await s3Client.send(command);
    } else if (type === 'folder') {
      // List all objects in the folder
      const listCommand = new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: key
      });

      const response = await s3Client.send(listCommand);

      if (response.Contents && response.Contents.length > 0) {
        // Delete all objects in the folder
        const objects = response.Contents.map((item) => ({
          Key: item.Key || ''
        }));

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: S3_BUCKET,
          Delete: { Objects: objects }
        });

        await s3Client.send(deleteCommand);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    return NextResponse.json({ error: 'Failed to delete S3 object' }, { status: 500 });
  }
}
