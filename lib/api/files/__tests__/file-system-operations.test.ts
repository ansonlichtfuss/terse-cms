import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileSystemOperations } from '../file-system-operations';

// Mock the fs module
vi.mock('fs', () => vol);
vi.mock('node:fs', () => vol);

describe('FileSystemOperations', () => {
  let fileOps: FileSystemOperations;

  beforeEach(() => {
    vol.reset();
    fileOps = new FileSystemOperations('/test-root');
  });

  afterEach(() => {
    vol.reset();
  });

  describe('composition and delegation', () => {
    it('should delegate readFile to FileReadWriteOperations', async () => {
      vol.fromJSON({
        '/test-root/test.md': 'test content'
      });

      const result = await fileOps.readFile('test.md');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        path: 'test.md',
        content: 'test content',
        lastModified: expect.any(String)
      });
    });

    it('should delegate writeFile to FileReadWriteOperations', async () => {
      const result = await fileOps.writeFile('new.md', 'new content');

      expect(result.success).toBe(true);
      expect(vol.readFileSync('/test-root/new.md', 'utf8')).toBe('new content');
    });

    it('should delegate exists to FileReadWriteOperations', async () => {
      vol.fromJSON({
        '/test-root/exists.md': 'content'
      });

      const result = await fileOps.exists('exists.md');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        exists: true,
        isDirectory: false
      });
    });

    it('should delegate deleteFile to FileManagementOperations', async () => {
      vol.fromJSON({
        '/test-root/delete.md': 'content'
      });

      const result = await fileOps.deleteFile('delete.md');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/delete.md')).toBe(false);
    });

    it('should delegate moveFile to FileManagementOperations', async () => {
      vol.fromJSON({
        '/test-root/source.md': 'content',
        '/test-root/destination': null
      });

      const result = await fileOps.moveFile('source.md', 'destination');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/destination/source.md')).toBe(true);
      expect(vol.existsSync('/test-root/source.md')).toBe(false);
    });

    it('should delegate renameFile to FileManagementOperations', async () => {
      vol.fromJSON({
        '/test-root/old.md': 'content'
      });

      const result = await fileOps.renameFile('old.md', 'new.md');

      expect(result.success).toBe(true);
      expect(vol.existsSync('/test-root/new.md')).toBe(true);
      expect(vol.existsSync('/test-root/old.md')).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete file lifecycle', async () => {
      // Create a file
      const createResult = await fileOps.writeFile('lifecycle.md', 'initial content');
      expect(createResult.success).toBe(true);

      // Read the file
      const readResult = await fileOps.readFile('lifecycle.md');
      expect(readResult.success).toBe(true);
      expect(readResult.data!.content).toBe('initial content');

      // Check existence
      const existsResult = await fileOps.exists('lifecycle.md');
      expect(existsResult.success).toBe(true);
      expect(existsResult.data!.exists).toBe(true);

      // Rename the file
      const renameResult = await fileOps.renameFile('lifecycle.md', 'renamed.md');
      expect(renameResult.success).toBe(true);

      // Verify old name doesn't exist
      const oldExistsResult = await fileOps.exists('lifecycle.md');
      expect(oldExistsResult.data!.exists).toBe(false);

      // Verify new name exists
      const newExistsResult = await fileOps.exists('renamed.md');
      expect(newExistsResult.data!.exists).toBe(true);

      // Delete the file
      const deleteResult = await fileOps.deleteFile('renamed.md');
      expect(deleteResult.success).toBe(true);

      // Verify file is gone
      const finalExistsResult = await fileOps.exists('renamed.md');
      expect(finalExistsResult.data!.exists).toBe(false);
    });

    it('should handle directory operations', async () => {
      // Create files in nested structure
      await fileOps.writeFile('folder/subfolder/file1.md', 'content1');
      await fileOps.writeFile('folder/subfolder/file2.md', 'content2');
      await fileOps.writeFile('folder/file3.md', 'content3');

      // Verify structure exists
      const folderExists = await fileOps.exists('folder');
      expect(folderExists.data!.exists).toBe(true);
      expect(folderExists.data!.isDirectory).toBe(true);

      const subfolderExists = await fileOps.exists('folder/subfolder');
      expect(subfolderExists.data!.exists).toBe(true);
      expect(subfolderExists.data!.isDirectory).toBe(true);

      // Move entire folder
      const moveResult = await fileOps.moveFile('folder', 'new-location');
      expect(moveResult.success).toBe(true);

      // Verify old location is gone
      const oldFolderExists = await fileOps.exists('folder');
      expect(oldFolderExists.data!.exists).toBe(false);

      // Verify new location exists
      const newLocationExists = await fileOps.exists('new-location/folder');
      expect(newLocationExists.data!.exists).toBe(true);

      // Verify files are accessible in new location
      const file1Read = await fileOps.readFile('new-location/folder/subfolder/file1.md');
      expect(file1Read.success).toBe(true);
      expect(file1Read.data!.content).toBe('content1');

      // Delete entire structure
      const deleteResult = await fileOps.deleteFile('new-location');
      expect(deleteResult.success).toBe(true);

      // Verify everything is gone
      const finalExists = await fileOps.exists('new-location');
      expect(finalExists.data!.exists).toBe(false);
    });

    it('should handle error propagation correctly', async () => {
      // Test error propagation from read operations
      const readResult = await fileOps.readFile('nonexistent.md');
      expect(readResult.success).toBe(false);
      expect(readResult.statusCode).toBe(404);

      // Test error propagation from management operations
      const deleteResult = await fileOps.deleteFile('nonexistent.md');
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.statusCode).toBe(404);

      // Test error propagation from path validation
      const invalidResult = await fileOps.readFile('../invalid.md');
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.statusCode).toBe(400);
    });

    it('should maintain consistent root directory across operations', async () => {
      // Create file in one operation
      const writeResult = await fileOps.writeFile('test.md', 'content');
      expect(writeResult.success).toBe(true);

      // Read it back in another operation
      const readResult = await fileOps.readFile('test.md');
      expect(readResult.success).toBe(true);
      expect(readResult.data!.content).toBe('content');

      // Move it in a third operation
      await fileOps.writeFile('destination/placeholder.md', 'placeholder');
      const moveResult = await fileOps.moveFile('test.md', 'destination');
      expect(moveResult.success).toBe(true);

      // Verify it's in the right place
      const movedReadResult = await fileOps.readFile('destination/test.md');
      expect(movedReadResult.success).toBe(true);
      expect(movedReadResult.data!.content).toBe('content');
    });
  });

  describe('performance and resource management', () => {
    it('should handle multiple concurrent operations', async () => {
      const operations = [];

      // Create multiple files concurrently
      for (let i = 0; i < 10; i++) {
        operations.push(fileOps.writeFile(`file${i}.md`, `content ${i}`));
      }

      const results = await Promise.all(operations);

      // All operations should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // Verify all files exist
      for (let i = 0; i < 10; i++) {
        const existsResult = await fileOps.exists(`file${i}.md`);
        expect(existsResult.data!.exists).toBe(true);
      }
    });

    it('should properly isolate operations by root directory', async () => {
      const fileOps1 = new FileSystemOperations('/root1');
      const fileOps2 = new FileSystemOperations('/root2');

      // Setup file systems
      vol.fromJSON({
        '/root1/shared-name.md': 'content from root1',
        '/root2/shared-name.md': 'content from root2'
      });

      // Read same filename from different roots
      const result1 = await fileOps1.readFile('shared-name.md');
      const result2 = await fileOps2.readFile('shared-name.md');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data!.content).toBe('content from root1');
      expect(result2.data!.content).toBe('content from root2');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle invalid constructor parameters gracefully', () => {
      // Test with empty root directory
      const emptyRootOps = new FileSystemOperations('');
      expect(emptyRootOps).toBeDefined();

      // Test with unusual root directory
      const unusualRootOps = new FileSystemOperations('/unusual/path/with/spaces and symbols!@#');
      expect(unusualRootOps).toBeDefined();
    });

    it('should maintain operation consistency under error conditions', async () => {
      vol.fromJSON({
        '/test-root/existing.md': 'existing content'
      });

      // Attempt invalid operation that should fail
      const invalidResult = await fileOps.moveFile('existing.md', '../invalid-destination');
      expect(invalidResult.success).toBe(false);

      // Verify original file is still intact
      const checkResult = await fileOps.readFile('existing.md');
      expect(checkResult.success).toBe(true);
      expect(checkResult.data!.content).toBe('existing content');
    });

    it('should handle complex nested operations', async () => {
      // Create complex nested structure
      const paths = [
        'project/src/components/ui/button.md',
        'project/src/components/forms/input.md',
        'project/docs/api/endpoints.md',
        'project/docs/guides/getting-started.md',
        'project/tests/unit/components.md'
      ];

      // Create all files
      for (const path of paths) {
        const result = await fileOps.writeFile(path, `Content for ${path}`);
        expect(result.success).toBe(true);
      }

      // Verify all files exist and are readable
      for (const path of paths) {
        const existsResult = await fileOps.exists(path);
        expect(existsResult.success).toBe(true);
        expect(existsResult.data!.exists).toBe(true);

        const readResult = await fileOps.readFile(path);
        expect(readResult.success).toBe(true);
        expect(readResult.data!.content).toBe(`Content for ${path}`);
      }

      // Rename top-level directory
      const renameResult = await fileOps.renameFile('project', 'my-project');
      expect(renameResult.success).toBe(true);

      // Verify all files are accessible under new name
      for (const path of paths) {
        const newPath = path.replace('project/', 'my-project/');
        const readResult = await fileOps.readFile(newPath);
        expect(readResult.success).toBe(true);
        expect(readResult.data!.content).toBe(`Content for ${path}`);
      }
    });
  });
});
