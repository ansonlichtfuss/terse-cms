import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileManagementOperations } from '../file-management-operations';

// Mock the fs module
vi.mock('fs', () => vol);
vi.mock('node:fs', () => vol);

describe('FileManagementOperations', () => {
  let fileOps: FileManagementOperations;

  beforeEach(() => {
    vol.reset();
    fileOps = new FileManagementOperations('/test-root');
  });

  afterEach(() => {
    vol.reset();
  });

  describe('deleteFile', () => {
    it('should successfully delete an existing file', async () => {
      vol.fromJSON({
        '/test-root/test.md': 'Test content'
      });

      const result = await fileOps.deleteFile('test.md');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.error).toBeUndefined();

      // Verify file was deleted
      expect(vol.existsSync('/test-root/test.md')).toBe(false);
    });

    it('should successfully delete a directory recursively', async () => {
      vol.fromJSON({
        '/test-root/folder/file1.md': 'content1',
        '/test-root/folder/subfolder/file2.md': 'content2'
      });

      const result = await fileOps.deleteFile('folder');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);

      // Verify directory and all contents were deleted
      expect(vol.existsSync('/test-root/folder')).toBe(false);
    });

    it('should return 404 for non-existent file', async () => {
      const result = await fileOps.deleteFile('nonexistent.md');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('File not found');
    });

    it('should reject invalid file paths', async () => {
      const invalidPaths = ['../outside.md', '/absolute.md', ''];

      for (const path of invalidPaths) {
        const result = await fileOps.deleteFile(path);

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.error).toBeDefined();
      }
    });

    it('should handle nested file deletion', async () => {
      vol.fromJSON({
        '/test-root/deep/nested/file.md': 'content'
      });

      const result = await fileOps.deleteFile('deep/nested/file.md');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/deep/nested/file.md')).toBe(false);
      // Parent directories should still exist
      expect(vol.existsSync('/test-root/deep/nested')).toBe(true);
      expect(vol.existsSync('/test-root/deep')).toBe(true);
    });

    it('should handle file system errors', async () => {
      vol.fromJSON({
        '/test-root/error.md': 'content'
      });

      // Mock fs.unlinkSync to throw an error
      vi.spyOn(vol, 'unlinkSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await fileOps.deleteFile('error.md');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Failed to delete file');

      // Restore original function
      vi.restoreAllMocks();
    });
  });

  describe('moveFile', () => {
    it('should successfully move a file to existing directory', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'source content',
        '/test-root/destination': null
      });

      const result = await fileOps.moveFile('source.md', 'destination');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);

      // Verify file was moved
      expect(vol.existsSync('/test-root/source.md')).toBe(false);
      expect(vol.existsSync('/test-root/destination/source.md')).toBe(true);
      expect(vol.readFileSync('/test-root/destination/source.md', 'utf8')).toBe('source content');
    });

    it('should create destination directory if it does not exist', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'source content'
      });

      const result = await fileOps.moveFile('source.md', 'new-destination');

      expect(result.success).toBe(true);

      // Verify destination directory was created and file was moved
      expect(vol.existsSync('/test-root/new-destination')).toBe(true);
      expect(vol.existsSync('/test-root/new-destination/source.md')).toBe(true);
      expect(vol.existsSync('/test-root/source.md')).toBe(false);
    });

    it('should move files between nested directories', async () => {
      vol.fromJSON({
        '/test-root/folder1/file.md': 'content',
        '/test-root/folder2': null
      });

      const result = await fileOps.moveFile('folder1/file.md', 'folder2');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/folder1/file.md')).toBe(false);
      expect(vol.existsSync('/test-root/folder2/file.md')).toBe(true);
    });

    it('should return 404 for non-existent source file', async () => {
      const result = await fileOps.moveFile('nonexistent.md', 'destination');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Source file not found');
    });

    it('should reject invalid source paths', async () => {
      const result = await fileOps.moveFile('../outside.md', 'destination');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain('Invalid source path');
    });

    it('should reject invalid destination paths', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'content'
      });

      const result = await fileOps.moveFile('source.md', '../outside');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toContain('Invalid destination path');
    });

    it('should move directories recursively', async () => {
      vol.fromJSON({
        '/test-root/source-dir/file1.md': 'content1',
        '/test-root/source-dir/subfolder/file2.md': 'content2',
        '/test-root/destination': null
      });

      const result = await fileOps.moveFile('source-dir', 'destination');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/source-dir')).toBe(false);
      expect(vol.existsSync('/test-root/destination/source-dir')).toBe(true);
      expect(vol.existsSync('/test-root/destination/source-dir/file1.md')).toBe(true);
      expect(vol.existsSync('/test-root/destination/source-dir/subfolder/file2.md')).toBe(true);
    });

    it('should handle file system errors', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'content',
        '/test-root/destination': null
      });

      // Mock fs.renameSync to throw an error
      vi.spyOn(vol, 'renameSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await fileOps.moveFile('source.md', 'destination');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Failed to move file');

      // Restore original function
      vi.restoreAllMocks();
    });
  });

  describe('renameFile', () => {
    it('should successfully rename a file', async () => {
      vol.fromJSON({
        '/test-root/old-name.md': 'content'
      });

      const result = await fileOps.renameFile('old-name.md', 'new-name.md');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);

      // Verify file was renamed
      expect(vol.existsSync('/test-root/old-name.md')).toBe(false);
      expect(vol.existsSync('/test-root/new-name.md')).toBe(true);
      expect(vol.readFileSync('/test-root/new-name.md', 'utf8')).toBe('content');
    });

    it('should successfully rename a directory', async () => {
      vol.fromJSON({
        '/test-root/old-folder/file.md': 'content'
      });

      const result = await fileOps.renameFile('old-folder', 'new-folder');

      expect(result.success).toBe(true);

      // Verify directory was renamed
      expect(vol.existsSync('/test-root/old-folder')).toBe(false);
      expect(vol.existsSync('/test-root/new-folder')).toBe(true);
      expect(vol.existsSync('/test-root/new-folder/file.md')).toBe(true);
    });

    it('should rename files in nested directories', async () => {
      vol.fromJSON({
        '/test-root/folder/old.md': 'content'
      });

      const result = await fileOps.renameFile('folder/old.md', 'new.md');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/folder/old.md')).toBe(false);
      expect(vol.existsSync('/test-root/folder/new.md')).toBe(true);
    });

    it('should return 404 for non-existent source file', async () => {
      const result = await fileOps.renameFile('nonexistent.md', 'new-name.md');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Source file not found');
    });

    it('should reject invalid source paths', async () => {
      const result = await fileOps.renameFile('../outside.md', 'new-name.md');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBeDefined();
    });

    it('should reject empty or invalid new names', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'content'
      });

      const invalidNames = ['', '   ', null, undefined];

      for (const name of invalidNames) {
        const result = await fileOps.renameFile('source.md', name as string);

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.error).toBe('New name is required');
      }
    });

    it('should trim whitespace from new names', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'content'
      });

      const result = await fileOps.renameFile('source.md', '  trimmed.md  ');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/trimmed.md')).toBe(true);
    });

    it('should handle special characters in new names', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'content'
      });

      const specialNames = [
        'file with spaces.md',
        'file-with-hyphens.md',
        'file_with_underscores.md',
        'file.with.dots.md',
        'file@symbol.md'
      ];

      for (const newName of specialNames) {
        // Reset the file
        vol.fromJSON({
          '/test-root/source.md': 'content'
        });

        const result = await fileOps.renameFile('source.md', newName);
        expect(result.success).toBe(true);
        expect(vol.existsSync(`/test-root/${newName}`)).toBe(true);
      }
    });

    it('should handle file system errors', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'content'
      });

      // Mock fs.renameSync to throw an error
      vi.spyOn(vol, 'renameSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await fileOps.renameFile('source.md', 'new-name.md');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Failed to rename file');

      // Restore original function
      vi.restoreAllMocks();
    });
  });

  describe('edge cases', () => {
    it('should handle moving files with same name to different directories', async () => {
      vol.fromJSON({
        '/test-root/folder1/file.md': 'content1',
        '/test-root/folder2/file.md': 'content2'
      });

      const result = await fileOps.moveFile('folder1/file.md', 'folder2');

      expect(result.success).toBe(true);
      // The move should overwrite the existing file
      expect(vol.readFileSync('/test-root/folder2/file.md', 'utf8')).toBe('content1');
    });

    it('should handle renaming to existing file name (overwrite)', async () => {
      vol.fromJSON({
        '/test-root/file1.md': 'content1',
        '/test-root/file2.md': 'content2'
      });

      const result = await fileOps.renameFile('file1.md', 'file2.md');

      expect(result.success).toBe(true);
      // The rename should overwrite the existing file
      expect(vol.readFileSync('/test-root/file2.md', 'utf8')).toBe('content1');
    });

    it('should handle very long file names', async () => {
      const longName = 'a'.repeat(100) + '.md';
      vol.fromJSON({
        '/test-root/source.md': 'content'
      });

      const result = await fileOps.renameFile('source.md', longName);

      expect(result.success).toBe(true);
      expect(vol.existsSync(`/test-root/${longName}`)).toBe(true);
    });

    it('should handle deep nested directory operations', async () => {
      vol.fromJSON({
        '/test-root/a/b/c/d/e/file.md': 'deep content',
        '/test-root/x/y/z': null
      });

      const result = await fileOps.moveFile('a/b/c/d/e/file.md', 'x/y/z');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/x/y/z/file.md')).toBe(true);
      expect(vol.existsSync('/test-root/a/b/c/d/e/file.md')).toBe(false);
    });
  });
});
