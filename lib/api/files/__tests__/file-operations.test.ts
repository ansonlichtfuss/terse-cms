import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ExistenceInfo, FileOperations } from '../file-operations';

// Mock the fs module
vi.mock('fs', () => vol);
vi.mock('node:fs', () => vol);

// Mock the environment and path utilities
vi.mock('@/lib/env', () => ({
  shouldUseMockApi: vi.fn()
}));

vi.mock('@/lib/paths', () => ({
  getMarkdownRootDir: vi.fn(() => '/production-root'),
  getRepositoryPath: vi.fn(() => '/production-root')
}));

describe('FileOperations', () => {
  let fileOps: FileOperations;

  beforeEach(() => {
    vol.reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vol.reset();
  });

  describe('environment configuration', () => {
    it('should use mock data directory when USE_MOCK_API is true', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);

      fileOps = new FileOperations();

      // Setup mock data
      vol.fromJSON({
        'mock-data/filesystem/test.md': 'mock content'
      });

      const result = await fileOps.readFile('test.md');

      expect(result.success).toBe(true);
      expect(result.data!.content).toBe('mock content');
    });

    it('should use production directory when USE_MOCK_API is false', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(false);

      fileOps = new FileOperations('1');

      // Setup production data
      vol.fromJSON({
        '/production-root/test.md': 'production content'
      });

      const result = await fileOps.readFile('test.md');

      expect(result.success).toBe(true);
      expect(result.data!.content).toBe('production content');
    });
  });

  describe('file operations delegation', () => {
    beforeEach(async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);
      fileOps = new FileOperations();
    });

    it('should delegate all basic file operations correctly', async () => {
      vol.fromJSON({
        'mock-data/filesystem/existing.md': 'existing content'
      });

      // Test readFile delegation
      const readResult = await fileOps.readFile('existing.md');
      expect(readResult.success).toBe(true);
      expect(readResult.data!.content).toBe('existing content');

      // Test writeFile delegation
      const writeResult = await fileOps.writeFile('new.md', 'new content');
      expect(writeResult.success).toBe(true);

      // Test exists delegation
      const existsResult = await fileOps.exists('new.md');
      expect(existsResult.success).toBe(true);
      expect(existsResult.data!.exists).toBe(true);

      // Test deleteFile delegation
      const deleteResult = await fileOps.deleteFile('existing.md');
      expect(deleteResult.success).toBe(true);

      // Test moveFile delegation
      await fileOps.writeFile('source.md', 'source content');
      vol.mkdirSync('mock-data/filesystem/destination', { recursive: true });
      const moveResult = await fileOps.moveFile('source.md', 'destination');
      expect(moveResult.success).toBe(true);

      // Test renameFile delegation
      await fileOps.writeFile('old-name.md', 'rename content');
      const renameResult = await fileOps.renameFile('old-name.md', 'new-name.md');
      expect(renameResult.success).toBe(true);
    });

    it('should handle getFileTree operation', async () => {
      // Create test file structure
      vol.fromJSON({
        'mock-data/filesystem/file1.md': 'content1',
        'mock-data/filesystem/file2.md': 'content2',
        'mock-data/filesystem/folder/nested.md': 'nested content',
        'mock-data/filesystem/folder/ignored.txt': 'ignored',
        'mock-data/filesystem/.hidden.md': 'hidden'
      });

      const result = await fileOps.getFileTree();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.files).toBeDefined();

      const files = result.data!.files;

      // Should have folder (directory) and 2 markdown files
      expect(files).toHaveLength(3);

      // Check directory structure
      const folder = files.find((f) => f.type === 'directory');
      expect(folder).toBeDefined();
      expect(folder!.name).toBe('folder');
      expect(folder!.children).toBeDefined();
      expect(folder!.children!).toHaveLength(1); // Only nested.md, not ignored.txt

      // Check markdown files
      const markdownFiles = files.filter((f) => f.type === 'file');
      expect(markdownFiles).toHaveLength(2);
      expect(markdownFiles.map((f) => f.name).sort()).toEqual(['file1.md', 'file2.md']);
    });
  });

  describe('integration scenarios', () => {
    beforeEach(async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);
      fileOps = new FileOperations();
    });

    it('should handle complete file management workflow', async () => {
      // Start with empty filesystem
      vol.fromJSON({
        'mock-data/filesystem': null
      });

      // Create a new file
      const createResult = await fileOps.writeFile('workflow.md', '# Workflow Test\n\nInitial content');
      expect(createResult.success).toBe(true);

      // Verify file appears in tree
      const treeResult1 = await fileOps.getFileTree();
      expect(treeResult1.success).toBe(true);
      expect(treeResult1.data!.files).toHaveLength(1);
      expect(treeResult1.data!.files[0].name).toBe('workflow.md');

      // Read and modify the file
      const readResult = await fileOps.readFile('workflow.md');
      expect(readResult.success).toBe(true);

      const updatedContent = readResult.data!.content + '\n\nUpdated content';
      const updateResult = await fileOps.writeFile('workflow.md', updatedContent);
      expect(updateResult.success).toBe(true);

      // Create a folder structure
      await fileOps.writeFile('docs/api.md', '# API Documentation');
      await fileOps.writeFile('docs/guides/setup.md', '# Setup Guide');

      // Verify folder structure in tree
      const treeResult2 = await fileOps.getFileTree();
      expect(treeResult2.success).toBe(true);
      expect(treeResult2.data!.files).toHaveLength(2); // workflow.md and docs folder

      const docsFolder = treeResult2.data!.files.find((f) => f.name === 'docs');
      expect(docsFolder).toBeDefined();
      expect(docsFolder!.type).toBe('directory');
      expect(docsFolder!.children).toHaveLength(2); // api.md and guides folder

      // Move file to subfolder
      const moveResult = await fileOps.moveFile('workflow.md', 'docs');
      expect(moveResult.success).toBe(true);

      // Verify file is in new location
      const movedReadResult = await fileOps.readFile('docs/workflow.md');
      expect(movedReadResult.success).toBe(true);
      expect(movedReadResult.data!.content).toBe(updatedContent);

      // Rename the moved file
      const renameResult = await fileOps.renameFile('docs/workflow.md', 'project-workflow.md');
      expect(renameResult.success).toBe(true);

      // Verify renamed file exists
      const renamedReadResult = await fileOps.readFile('docs/project-workflow.md');
      expect(renamedReadResult.success).toBe(true);
      expect(renamedReadResult.data!.content).toBe(updatedContent);

      // Clean up by deleting entire docs folder
      const deleteResult = await fileOps.deleteFile('docs');
      expect(deleteResult.success).toBe(true);

      // Verify everything is cleaned up
      const finalTreeResult = await fileOps.getFileTree();
      expect(finalTreeResult.success).toBe(true);
      expect(finalTreeResult.data!.files).toHaveLength(0);
    });

    it('should handle concurrent operations safely', async () => {
      const operations = [];

      // Create multiple files concurrently
      for (let i = 0; i < 5; i++) {
        operations.push(fileOps.writeFile(`concurrent-${i}.md`, `Content ${i}`));
      }

      // Create some folders concurrently
      for (let i = 0; i < 3; i++) {
        operations.push(fileOps.writeFile(`folder-${i}/file.md`, `Folder ${i} content`));
      }

      const results = await Promise.all(operations);

      // All operations should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // Verify file tree shows all created items
      const treeResult = await fileOps.getFileTree();
      expect(treeResult.success).toBe(true);
      expect(treeResult.data!.files.length).toBeGreaterThanOrEqual(8); // 5 files + 3 folders

      // Verify specific files can be read
      for (let i = 0; i < 5; i++) {
        const readResult = await fileOps.readFile(`concurrent-${i}.md`);
        expect(readResult.success).toBe(true);
        expect(readResult.data!.content).toBe(`Content ${i}`);
      }
    });

    it('should maintain data consistency across environment switches', async () => {
      const { shouldUseMockApi } = await import('@/lib/env');

      // Start with mock environment
      vi.mocked(shouldUseMockApi).mockReturnValue(true);
      const mockFileOps = new FileOperations();

      vol.fromJSON({
        'mock-data/filesystem/mock-file.md': 'mock content'
      });

      const mockResult = await mockFileOps.readFile('mock-file.md');
      expect(mockResult.success).toBe(true);
      expect(mockResult.data!.content).toBe('mock content');

      // Switch to production environment
      vi.mocked(shouldUseMockApi).mockReturnValue(false);
      const prodFileOps = new FileOperations('1');

      vol.fromJSON({
        '/production-root/prod-file.md': 'production content'
      });

      const prodResult = await prodFileOps.readFile('prod-file.md');
      expect(prodResult.success).toBe(true);
      expect(prodResult.data!.content).toBe('production content');

      // Verify mock file is not accessible from production ops
      const crossResult = await prodFileOps.readFile('mock-file.md');
      expect(crossResult.success).toBe(false);
    });
  });

  describe('error handling and edge cases', () => {
    beforeEach(async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);
      fileOps = new FileOperations();
    });

    it('should handle errors gracefully in all operations', async () => {
      // Test error handling for non-existent files
      const readError = await fileOps.readFile('nonexistent.md');
      expect(readError.success).toBe(false);
      expect(readError.statusCode).toBe(404);

      const deleteError = await fileOps.deleteFile('nonexistent.md');
      expect(deleteError.success).toBe(false);
      expect(deleteError.statusCode).toBe(404);

      const moveError = await fileOps.moveFile('nonexistent.md', 'destination');
      expect(moveError.success).toBe(false);
      expect(moveError.statusCode).toBe(404);

      const renameError = await fileOps.renameFile('nonexistent.md', 'new-name.md');
      expect(renameError.success).toBe(false);
      expect(renameError.statusCode).toBe(404);

      // Test error handling for invalid paths
      const invalidPathError = await fileOps.readFile('../invalid.md');
      expect(invalidPathError.success).toBe(false);
      expect(invalidPathError.statusCode).toBe(400);
    });

    it('should handle file tree errors gracefully', async () => {
      // Mock fs.readdirSync to throw an error for getFileTree
      vi.spyOn(vol, 'readdirSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const treeResult = await fileOps.getFileTree();

      expect(treeResult.success).toBe(false);
      expect(treeResult.statusCode).toBe(500);
      expect(treeResult.error).toBe('Failed to read file tree');

      // Restore original function
      vi.restoreAllMocks();
    });

    it('should handle complex file operations with mixed success/failure', async () => {
      // Create some files
      await fileOps.writeFile('success1.md', 'content1');
      await fileOps.writeFile('success2.md', 'content2');

      // Mix successful and failing operations
      const operations = [
        fileOps.readFile('success1.md'), // Should succeed
        fileOps.readFile('nonexistent.md'), // Should fail
        fileOps.exists('success2.md'), // Should succeed
        fileOps.exists('nonexistent.md'), // Should succeed but return false
        fileOps.deleteFile('success1.md'), // Should succeed
        fileOps.deleteFile('already-deleted.md') // Should fail
      ];

      const results = await Promise.all(operations);

      expect(results[0].success).toBe(true); // read success1.md
      expect(results[1].success).toBe(false); // read nonexistent.md
      expect(results[2].success).toBe(true); // exists success2.md
      expect(results[3].success).toBe(true); // exists nonexistent.md (operation succeeds, but exists = false)
      expect((results[3].data as ExistenceInfo)!.exists).toBe(false);
      expect(results[4].success).toBe(true); // delete success1.md
      expect(results[5].success).toBe(false); // delete already-deleted.md
    });

    it('should handle type consistency and exports', () => {
      // Verify all types are properly exported
      expect(typeof FileOperations).toBe('function');

      // Verify constructor works
      const instance = new FileOperations();
      expect(instance).toBeInstanceOf(FileOperations);

      // Verify all methods exist
      expect(typeof instance.readFile).toBe('function');
      expect(typeof instance.writeFile).toBe('function');
      expect(typeof instance.deleteFile).toBe('function');
      expect(typeof instance.exists).toBe('function');
      expect(typeof instance.moveFile).toBe('function');
      expect(typeof instance.renameFile).toBe('function');
      expect(typeof instance.getFileTree).toBe('function');
    });
  });

  describe('backward compatibility', () => {
    beforeEach(async () => {
      const { shouldUseMockApi } = await import('@/lib/env');
      vi.mocked(shouldUseMockApi).mockReturnValue(true);
      fileOps = new FileOperations();
    });

    it('should maintain the same API as the original monolithic file', async () => {
      // Create test data
      vol.fromJSON({
        'mock-data/filesystem/api-test.md': 'API content',
        'mock-data/filesystem/folder/nested.md': 'nested content'
      });

      // Test that all original methods work with same signatures
      const readResult = await fileOps.readFile('api-test.md');
      expect(readResult).toMatchObject({
        success: true,
        statusCode: 200,
        data: {
          path: 'api-test.md',
          content: 'API content'
        }
      });

      const writeResult = await fileOps.writeFile('new-api-test.md', 'new content');
      expect(writeResult).toMatchObject({
        success: true,
        statusCode: 200
      });

      const existsResult = await fileOps.exists('api-test.md');
      expect(existsResult).toMatchObject({
        success: true,
        statusCode: 200,
        data: {
          exists: true,
          isDirectory: false
        }
      });

      const treeResult = await fileOps.getFileTree();
      expect(treeResult).toMatchObject({
        success: true,
        statusCode: 200,
        data: {
          files: expect.any(Array)
        }
      });

      // Verify file tree structure matches expected format
      const files = treeResult.data!.files;
      files.forEach((file) => {
        expect(file).toMatchObject({
          name: expect.any(String),
          path: expect.any(String),
          type: expect.stringMatching(/^(file|directory)$/)
        });
      });
    });
  });
});
