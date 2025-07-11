import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileTreeBuilder } from '../file-tree-builder';

// Mock the fs module
vi.mock('fs', () => vol);
vi.mock('node:fs', () => vol);

describe('FileTreeBuilder', () => {
  beforeEach(() => {
    vol.reset();
  });

  afterEach(() => {
    vol.reset();
  });

  describe('buildDirectoryContents', () => {
    it('should build directory contents with markdown files only', async () => {
      // Create a mock file structure
      vol.fromJSON({
        '/test-root/file1.md': 'content1',
        '/test-root/file2.md': 'content2',
        '/test-root/file3.txt': 'ignored',
        '/test-root/subfolder/nested.md': 'nested content',
        '/test-root/subfolder/ignored.js': 'ignored',
        '/test-root/.hidden.md': 'hidden file',
        '/test-root/.git/config': 'git config'
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/test-root', '');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toBeDefined();

      const items = result.data!.items;
      expect(items).toHaveLength(3); // 2 files + 1 directory

      // Check that files are sorted with directories first
      const dirNode = items.find((f) => f.type === 'directory');
      const fileNodes = items.filter((f) => f.type === 'file');

      expect(dirNode).toBeDefined();
      expect(dirNode!.name).toBe('subfolder');
      expect(dirNode!.path).toBe('subfolder');

      // Check that lastModified is present
      expect(dirNode!.lastModified).toBeDefined();
      expect(dirNode!.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      expect(fileNodes).toHaveLength(2);
      expect(fileNodes.map((f) => f.name).sort()).toEqual(['file1.md', 'file2.md']);

      // Check that all files have lastModified
      fileNodes.forEach((file) => {
        expect(file.lastModified).toBeDefined();
        expect(file.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });

    it('should handle empty directory', async () => {
      vol.fromJSON({
        '/empty-root': null
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/empty-root', '');

      expect(result.success).toBe(true);
      expect(result.data!.items).toHaveLength(0);
    });

    it('should return 404 for non-existent root directory', async () => {
      const result = await FileTreeBuilder.buildDirectoryContents('/non-existent', '');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Directory not found: ');
    });

    it('should handle deeply nested directory navigation', async () => {
      vol.fromJSON({
        '/deep-root/level1/level2/level3/deep.md': 'deep content',
        '/deep-root/level1/level2/another.md': 'another content',
        '/deep-root/level1/first.md': 'first content',
        '/deep-root/root.md': 'root content'
      });

      // Test root level
      const rootResult = await FileTreeBuilder.buildDirectoryContents('/deep-root', '');
      expect(rootResult.success).toBe(true);
      const rootItems = rootResult.data!.items;
      expect(rootItems).toHaveLength(2); // level1 directory and root.md file

      // Test level1 directory
      const level1Result = await FileTreeBuilder.buildDirectoryContents('/deep-root', 'level1');
      expect(level1Result.success).toBe(true);
      const level1Items = level1Result.data!.items;
      expect(level1Items).toHaveLength(2); // first.md and level2 directory

      // Test level2 directory
      const level2Result = await FileTreeBuilder.buildDirectoryContents('/deep-root', 'level1/level2');
      expect(level2Result.success).toBe(true);
      const level2Items = level2Result.data!.items;
      expect(level2Items).toHaveLength(2); // another.md and level3 directory

      // Test level3 directory
      const level3Result = await FileTreeBuilder.buildDirectoryContents('/deep-root', 'level1/level2/level3');
      expect(level3Result.success).toBe(true);
      const level3Items = level3Result.data!.items;
      expect(level3Items).toHaveLength(1); // deep.md
      expect(level3Items[0].name).toBe('deep.md');
    });

    it('should sort files and directories correctly', async () => {
      vol.fromJSON({
        '/sort-test/z-file.md': 'content',
        '/sort-test/a-file.md': 'content',
        '/sort-test/m-file.md': 'content',
        '/sort-test/z-dir/file.md': 'content',
        '/sort-test/a-dir/file.md': 'content',
        '/sort-test/m-dir/file.md': 'content'
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/sort-test', '');

      expect(result.success).toBe(true);
      const items = result.data!.items;

      // Directories should come first, then files
      const names = items.map((f) => f.name);
      expect(names).toEqual(['a-dir', 'm-dir', 'z-dir', 'a-file.md', 'm-file.md', 'z-file.md']);

      // Check types
      const types = items.map((f) => f.type);
      expect(types).toEqual(['directory', 'directory', 'directory', 'file', 'file', 'file']);
    });

    it('should filter out hidden files and directories', async () => {
      vol.fromJSON({
        '/hidden-test/visible.md': 'content',
        '/hidden-test/.hidden-file.md': 'hidden content',
        '/hidden-test/.hidden-dir/file.md': 'hidden dir content',
        '/hidden-test/normal-dir/file.md': 'normal content'
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/hidden-test', '');

      expect(result.success).toBe(true);
      const files = result.data!.items;

      // Should only have visible.md and normal-dir
      expect(files).toHaveLength(2);
      expect(files.map((f) => f.name).sort()).toEqual(['normal-dir', 'visible.md']);
    });

    it('should filter out non-markdown files', async () => {
      vol.fromJSON({
        '/filter-test/document.md': 'markdown content',
        '/filter-test/script.js': 'javascript content',
        '/filter-test/style.css': 'css content',
        '/filter-test/image.jpg': 'binary content',
        '/filter-test/config.json': 'json content',
        '/filter-test/README.txt': 'text content'
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/filter-test', '');

      expect(result.success).toBe(true);
      const files = result.data!.items;

      // Should only have document.md
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('document.md');
      expect(files[0].type).toBe('file');
    });

    it('should handle correct path construction', async () => {
      vol.fromJSON({
        '/path-test/folder/subfolder/file.md': 'content'
      });

      // Test root directory
      const rootResult = await FileTreeBuilder.buildDirectoryContents('/path-test', '');
      expect(rootResult.success).toBe(true);
      const rootItems = rootResult.data!.items;
      expect(rootItems).toHaveLength(1);
      expect(rootItems[0].path).toBe('folder');

      // Test nested directory navigation
      const subResult = await FileTreeBuilder.buildDirectoryContents('/path-test', 'folder');
      expect(subResult.success).toBe(true);
      const subItems = subResult.data!.items;
      expect(subItems).toHaveLength(1);
      expect(subItems[0].path).toBe('folder/subfolder');

      // Test deeply nested directory
      const deepResult = await FileTreeBuilder.buildDirectoryContents('/path-test', 'folder/subfolder');
      expect(deepResult.success).toBe(true);
      const deepItems = deepResult.data!.items;
      expect(deepItems).toHaveLength(1);
      expect(deepItems[0].path).toBe('folder/subfolder/file.md');
    });

    it('should handle file system errors gracefully', async () => {
      // Create a directory first to pass the existence check
      vol.fromJSON({
        '/error-test': null
      });

      // Mock fs.readdirSync to throw an error
      vi.spyOn(vol, 'readdirSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/error-test', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to read directory contents');
      expect(result.statusCode).toBe(500);

      // Restore original function
      vi.restoreAllMocks();
    });

    it('should handle empty markdown directory', async () => {
      vol.fromJSON({
        '/empty-md-test': null,
        '/empty-md-test/non-md-file.txt': 'content'
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/empty-md-test', '');

      expect(result.success).toBe(true);
      expect(result.data!.items).toHaveLength(0);
    });

    it('should handle mixed file extensions correctly', async () => {
      vol.fromJSON({
        '/mixed-test': null,
        '/mixed-test/file.md': 'markdown',
        '/mixed-test/file.MD': 'uppercase markdown',
        '/mixed-test/file.markdown': 'full markdown',
        '/mixed-test/file.mdx': 'mdx file',
        '/mixed-test/file.txt': 'text file'
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/mixed-test', '');

      expect(result.success).toBe(true);
      const files = result.data!.items;

      // Should only include .md files, not .MD, .markdown, .mdx, or .txt
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('file.md');
    });

    it('should include lastModified timestamp for files and directories', async () => {
      vol.fromJSON({
        '/timestamp-test/file.md': 'content',
        '/timestamp-test/folder/nested.md': 'nested content'
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/timestamp-test', '');

      expect(result.success).toBe(true);
      const files = result.data!.items;

      // Check directory has lastModified
      const folder = files.find((f) => f.type === 'directory');
      expect(folder).toBeDefined();
      expect(folder!.lastModified).toBeDefined();
      expect(folder!.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Check file has lastModified
      const file = files.find((f) => f.type === 'file');
      expect(file).toBeDefined();
      expect(file!.lastModified).toBeDefined();
      expect(file!.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Verify lastModified can be parsed as valid Date
      expect(new Date(folder!.lastModified!).getTime()).toBeGreaterThan(0);
      expect(new Date(file!.lastModified!).getTime()).toBeGreaterThan(0);
    });

    it('should handle stat errors gracefully and continue processing', async () => {
      vol.fromJSON({
        '/error-test': null,
        '/error-test/good-file.md': 'content',
        '/error-test/folder': null,
        '/error-test/folder/nested.md': 'nested content'
      });

      // Mock fs.statSync to throw an error for testing error handling
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock statSync to throw error only for individual files, not the directory check
      const originalStatSync = vol.statSync.bind(vol);
      vi.spyOn(vol, 'statSync').mockImplementation((path) => {
        // Allow the initial directory check to work
        if (path === '/error-test') {
          return originalStatSync(path);
        }
        // Throw error for individual file stats
        throw new Error('Permission denied');
      });

      const result = await FileTreeBuilder.buildDirectoryContents('/error-test', '');

      expect(result.success).toBe(true);
      const files = result.data!.items;

      // Should still process all files even with stat errors
      expect(files).toHaveLength(2); // folder and good-file.md

      // All files should not have lastModified due to stat errors
      files.forEach((file) => {
        expect(file.lastModified).toBeUndefined();
      });

      // Should have logged warnings
      expect(consoleSpy).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });
});
