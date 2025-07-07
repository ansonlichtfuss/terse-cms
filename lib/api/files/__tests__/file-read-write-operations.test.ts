import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileReadWriteOperations } from '../file-read-write-operations';

// Mock the fs module
vi.mock('fs', () => vol);
vi.mock('node:fs', () => vol);

describe('FileReadWriteOperations', () => {
  let fileOps: FileReadWriteOperations;

  beforeEach(() => {
    vol.reset();
    fileOps = new FileReadWriteOperations('/test-root');
  });

  afterEach(() => {
    vol.reset();
  });

  describe('readFile', () => {
    it('should successfully read an existing file', async () => {
      vol.fromJSON({
        '/test-root/test.md': 'Test content'
      });

      const result = await fileOps.readFile('test.md');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual({
        path: 'test.md',
        content: 'Test content',
        lastModified: expect.any(String)
      });
      expect(result.error).toBeUndefined();
    });

    it('should handle file in nested directory', async () => {
      vol.fromJSON({
        '/test-root/folder/nested.md': 'Nested content'
      });

      const result = await fileOps.readFile('folder/nested.md');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        path: 'folder/nested.md',
        content: 'Nested content',
        lastModified: expect.any(String)
      });
    });

    it('should return 404 for non-existent file', async () => {
      const result = await fileOps.readFile('nonexistent.md');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('File not found');
      expect(result.data).toBeUndefined();
    });

    it('should reject invalid file paths', async () => {
      const invalidPaths = ['../outside.md', '/absolute.md', ''];

      for (const path of invalidPaths) {
        const result = await fileOps.readFile(path);

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.error).toBeDefined();
      }
    });

    it('should return error when trying to read a directory', async () => {
      vol.fromJSON({
        '/test-root/folder': null
      });

      const result = await fileOps.readFile('folder');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Path is a directory, not a file');
    });

    it('should handle UTF-8 content correctly', async () => {
      const utf8Content = 'Hello 世界 🌍 émojis and ñoñó';
      vol.fromJSON({
        '/test-root/utf8.md': utf8Content
      });

      const result = await fileOps.readFile('utf8.md');

      expect(result.success).toBe(true);
      expect(result.data!.content).toBe(utf8Content);
    });

    it('should handle file system errors', async () => {
      vol.fromJSON({
        '/test-root/error.md': 'content'
      });

      // Mock fs.readFileSync to throw an error
      vi.spyOn(vol, 'readFileSync').mockImplementation(() => {
        throw new Error('Disk error');
      });

      const result = await fileOps.readFile('error.md');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Failed to read file');

      // Restore original function
      vi.restoreAllMocks();
    });
  });

  describe('writeFile', () => {
    it('should successfully write content to a new file', async () => {
      const result = await fileOps.writeFile('new.md', 'New content');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.error).toBeUndefined();

      // Verify file was written
      expect(vol.readFileSync('/test-root/new.md', 'utf8')).toBe('New content');
    });

    it('should overwrite existing file', async () => {
      vol.fromJSON({
        '/test-root/existing.md': 'Old content'
      });

      const result = await fileOps.writeFile('existing.md', 'New content');

      expect(result.success).toBe(true);
      expect(vol.readFileSync('/test-root/existing.md', 'utf8')).toBe('New content');
    });

    it('should create nested directories', async () => {
      const result = await fileOps.writeFile('deep/nested/file.md', 'Deep content');

      expect(result.success).toBe(true);
      expect(vol.readFileSync('/test-root/deep/nested/file.md', 'utf8')).toBe('Deep content');
    });

    it('should reject invalid file paths', async () => {
      const invalidPaths = ['../outside.md', '/absolute.md', ''];

      for (const path of invalidPaths) {
        const result = await fileOps.writeFile(path, 'content');

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.error).toBeDefined();
      }
    });

    it('should reject null or undefined content', async () => {
      const result1 = await fileOps.writeFile('test.md', null as never);
      expect(result1.success).toBe(false);
      expect(result1.statusCode).toBe(400);
      expect(result1.error).toBe('Content is required');

      const result2 = await fileOps.writeFile('test.md', undefined as never);
      expect(result2.success).toBe(false);
      expect(result2.statusCode).toBe(400);
      expect(result2.error).toBe('Content is required');
    });

    it('should allow empty string content', async () => {
      const result = await fileOps.writeFile('empty.md', '');

      expect(result.success).toBe(true);
      expect(vol.readFileSync('/test-root/empty.md', 'utf8')).toBe('');
    });

    it('should prevent writing to existing directory', async () => {
      vol.fromJSON({
        '/test-root/folder': null
      });

      const result = await fileOps.writeFile('folder', 'content');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Cannot write to directory');
    });

    it('should handle UTF-8 content correctly', async () => {
      const utf8Content = 'Hello 世界 🌍 émojis and ñoñó';

      const result = await fileOps.writeFile('utf8.md', utf8Content);

      expect(result.success).toBe(true);
      expect(vol.readFileSync('/test-root/utf8.md', 'utf8')).toBe(utf8Content);
    });

    it('should handle file system errors', async () => {
      // Mock fs.writeFileSync to throw an error
      vi.spyOn(vol, 'writeFileSync').mockImplementation(() => {
        throw new Error('Disk full');
      });

      const result = await fileOps.writeFile('error.md', 'content');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Failed to write file');

      // Restore original function
      vi.restoreAllMocks();
    });
  });

  describe('exists', () => {
    it('should return true for existing file', async () => {
      vol.fromJSON({
        '/test-root/exists.md': 'content'
      });

      const result = await fileOps.exists('exists.md');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual({
        exists: true,
        isDirectory: false
      });
    });

    it('should return true for existing directory', async () => {
      vol.fromJSON({
        '/test-root/folder': null
      });

      const result = await fileOps.exists('folder');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        exists: true,
        isDirectory: true
      });
    });

    it('should return false for non-existent path', async () => {
      const result = await fileOps.exists('nonexistent.md');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual({
        exists: false,
        isDirectory: false
      });
    });

    it('should reject invalid file paths', async () => {
      const invalidPaths = ['../outside.md', '/absolute.md', ''];

      for (const path of invalidPaths) {
        const result = await fileOps.exists(path);

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.error).toBeDefined();
      }
    });

    it('should handle nested paths', async () => {
      vol.fromJSON({
        '/test-root/deep/nested/file.md': 'content'
      });

      const result1 = await fileOps.exists('deep');
      expect(result1.success).toBe(true);
      expect(result1.data!.exists).toBe(true);
      expect(result1.data!.isDirectory).toBe(true);

      const result2 = await fileOps.exists('deep/nested');
      expect(result2.success).toBe(true);
      expect(result2.data!.exists).toBe(true);
      expect(result2.data!.isDirectory).toBe(true);

      const result3 = await fileOps.exists('deep/nested/file.md');
      expect(result3.success).toBe(true);
      expect(result3.data!.exists).toBe(true);
      expect(result3.data!.isDirectory).toBe(false);
    });

    it('should handle file system errors', async () => {
      vol.fromJSON({
        '/test-root/error.md': 'content'
      });

      // Mock fs.lstatSync to throw an error
      vi.spyOn(vol, 'lstatSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await fileOps.exists('error.md');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Failed to check file existence');

      // Restore original function
      vi.restoreAllMocks();
    });
  });

  describe('edge cases', () => {
    it('should handle very long file paths', async () => {
      const longPath = 'a'.repeat(100) + '/' + 'b'.repeat(100) + '.md';

      const result = await fileOps.writeFile(longPath, 'content');
      expect(result.success).toBe(true);

      const readResult = await fileOps.readFile(longPath);
      expect(readResult.success).toBe(true);
      expect(readResult.data!.content).toBe('content');
    });

    it('should handle files with special characters in names', async () => {
      const specialNames = [
        'file with spaces.md',
        'file-with-hyphens.md',
        'file_with_underscores.md',
        'file.with.dots.md',
        'file@symbol.md',
        'file#hash.md',
        'file%.md'
      ];

      for (const name of specialNames) {
        const writeResult = await fileOps.writeFile(name, `content for ${name}`);
        expect(writeResult.success).toBe(true);

        const readResult = await fileOps.readFile(name);
        expect(readResult.success).toBe(true);
        expect(readResult.data!.content).toBe(`content for ${name}`);
      }
    });

    it('should handle large file content', async () => {
      const largeContent = 'x'.repeat(10000);

      const writeResult = await fileOps.writeFile('large.md', largeContent);
      expect(writeResult.success).toBe(true);

      const readResult = await fileOps.readFile('large.md');
      expect(readResult.success).toBe(true);
      expect(readResult.data!.content).toBe(largeContent);
    });
  });
});
