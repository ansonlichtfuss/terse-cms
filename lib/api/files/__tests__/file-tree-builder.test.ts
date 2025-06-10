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

  describe('buildFileTree', () => {
    it('should build file tree with markdown files only', async () => {
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

      const result = await FileTreeBuilder.buildFileTree('/test-root');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toBeDefined();

      const files = result.data!.files;
      expect(files).toHaveLength(3); // 2 files + 1 directory

      // Check that files are sorted with directories first
      const dirNode = files.find((f) => f.type === 'directory');
      const fileNodes = files.filter((f) => f.type === 'file');

      expect(dirNode).toBeDefined();
      expect(dirNode!.name).toBe('subfolder');
      expect(dirNode!.children).toHaveLength(1);
      expect(dirNode!.children![0].name).toBe('nested.md');

      expect(fileNodes).toHaveLength(2);
      expect(fileNodes.map((f) => f.name).sort()).toEqual(['file1.md', 'file2.md']);
    });

    it('should handle empty directory', async () => {
      vol.fromJSON({
        '/empty-root': null
      });

      const result = await FileTreeBuilder.buildFileTree('/empty-root');

      expect(result.success).toBe(true);
      expect(result.data!.files).toHaveLength(0);
    });

    it('should create directory if it does not exist', async () => {
      const result = await FileTreeBuilder.buildFileTree('/non-existent');

      expect(result.success).toBe(true);
      expect(result.data!.files).toHaveLength(0);
    });

    it('should handle deeply nested structure', async () => {
      vol.fromJSON({
        '/deep-root/level1/level2/level3/deep.md': 'deep content',
        '/deep-root/level1/level2/another.md': 'another content',
        '/deep-root/level1/first.md': 'first content',
        '/deep-root/root.md': 'root content'
      });

      const result = await FileTreeBuilder.buildFileTree('/deep-root');

      expect(result.success).toBe(true);
      const files = result.data!.files;

      // Should have level1 directory and root.md file
      expect(files).toHaveLength(2);

      const level1Dir = files.find((f) => f.name === 'level1');
      expect(level1Dir).toBeDefined();
      expect(level1Dir!.type).toBe('directory');
      expect(level1Dir!.children).toHaveLength(2); // first.md and level2 directory

      // Navigate to level2
      const level2Dir = level1Dir!.children!.find((f) => f.name === 'level2');
      expect(level2Dir).toBeDefined();
      expect(level2Dir!.type).toBe('directory');
      expect(level2Dir!.children).toHaveLength(2); // another.md and level3 directory

      // Navigate to level3
      const level3Dir = level2Dir!.children!.find((f) => f.name === 'level3');
      expect(level3Dir).toBeDefined();
      expect(level3Dir!.type).toBe('directory');
      expect(level3Dir!.children).toHaveLength(1); // deep.md
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

      const result = await FileTreeBuilder.buildFileTree('/sort-test');

      expect(result.success).toBe(true);
      const files = result.data!.files;

      // Directories should come first, then files
      const names = files.map((f) => f.name);
      expect(names).toEqual(['a-dir', 'm-dir', 'z-dir', 'a-file.md', 'm-file.md', 'z-file.md']);

      // Check types
      const types = files.map((f) => f.type);
      expect(types).toEqual(['directory', 'directory', 'directory', 'file', 'file', 'file']);
    });

    it('should filter out hidden files and directories', async () => {
      vol.fromJSON({
        '/hidden-test/visible.md': 'content',
        '/hidden-test/.hidden-file.md': 'hidden content',
        '/hidden-test/.hidden-dir/file.md': 'hidden dir content',
        '/hidden-test/normal-dir/file.md': 'normal content'
      });

      const result = await FileTreeBuilder.buildFileTree('/hidden-test');

      expect(result.success).toBe(true);
      const files = result.data!.files;

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

      const result = await FileTreeBuilder.buildFileTree('/filter-test');

      expect(result.success).toBe(true);
      const files = result.data!.files;

      // Should only have document.md
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('document.md');
      expect(files[0].type).toBe('file');
    });

    it('should handle correct path construction', async () => {
      vol.fromJSON({
        '/path-test/folder/subfolder/file.md': 'content'
      });

      const result = await FileTreeBuilder.buildFileTree('/path-test');

      expect(result.success).toBe(true);
      const files = result.data!.files;

      const folder = files[0];
      expect(folder.path).toBe('folder');

      const subfolder = folder.children![0];
      expect(subfolder.path).toBe('folder/subfolder');

      const file = subfolder.children![0];
      expect(file.path).toBe('folder/subfolder/file.md');
    });

    it('should handle file system errors gracefully', async () => {
      // Mock fs.readdirSync to throw an error
      vi.spyOn(vol, 'readdirSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await FileTreeBuilder.buildFileTree('/error-test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to read file tree');
      expect(result.statusCode).toBe(500);

      // Restore original function
      vi.restoreAllMocks();
    });

    it('should handle empty markdown directory', async () => {
      vol.fromJSON({
        '/empty-md-test/non-md-file.txt': 'content'
      });

      const result = await FileTreeBuilder.buildFileTree('/empty-md-test');

      expect(result.success).toBe(true);
      expect(result.data!.files).toHaveLength(0);
    });

    it('should handle mixed file extensions correctly', async () => {
      vol.fromJSON({
        '/mixed-test/file.md': 'markdown',
        '/mixed-test/file.MD': 'uppercase markdown',
        '/mixed-test/file.markdown': 'full markdown',
        '/mixed-test/file.mdx': 'mdx file',
        '/mixed-test/file.txt': 'text file'
      });

      const result = await FileTreeBuilder.buildFileTree('/mixed-test');

      expect(result.success).toBe(true);
      const files = result.data!.files;

      // Should only include .md files, not .MD, .markdown, .mdx, or .txt
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('file.md');
    });
  });
});
