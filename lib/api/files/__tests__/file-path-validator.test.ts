import { describe, expect, it } from 'vitest';

import { FilePathValidator } from '../file-path-validator';

describe('FilePathValidator', () => {
  describe('validatePath', () => {
    it('should return valid for correct relative paths', () => {
      const validPaths = [
        'file.md',
        'folder/file.md',
        'nested/folder/file.md',
        'hyphen-file.md',
        'underscore_file.md',
        'file with spaces.md',
        'numbers123.md',
        '中文文件.md',
        'UPPERCASE.md'
      ];

      validPaths.forEach((path) => {
        const result = FilePathValidator.validatePath(path);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject null or undefined paths', () => {
      const result1 = FilePathValidator.validatePath(null as never);
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Invalid file path');

      const result2 = FilePathValidator.validatePath(undefined as never);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Invalid file path');
    });

    it('should reject non-string paths', () => {
      const nonStringPaths = [123, true, {}, [], Symbol('test')];

      nonStringPaths.forEach((path) => {
        const result = FilePathValidator.validatePath(path as never);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid file path');
      });
    });

    it('should reject empty or whitespace-only paths', () => {
      const emptyPaths = ['', '   ', '\t', '\n', '\r'];

      emptyPaths.forEach((path) => {
        const result = FilePathValidator.validatePath(path);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(path === '' ? 'Invalid file path' : 'Empty file path');
      });
    });

    it('should reject paths with path traversal attempts', () => {
      const traversalPaths = [
        '../file.md',
        'folder/../file.md',
        '../../../etc/passwd',
        'folder/../../file.md',
        '..\\file.md',
        'folder\\..\\file.md',
        '~/file.md',
        'folder/~/file.md'
      ];

      traversalPaths.forEach((path) => {
        const result = FilePathValidator.validatePath(path);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Path traversal not allowed');
      });
    });

    it('should reject absolute paths', () => {
      const absolutePaths = [
        '/absolute/path/file.md',
        '/file.md',
        'C:\\Windows\\file.md',
        'D:\\folder\\file.md',
        '/usr/bin/file',
        'C:file.md'
      ];

      absolutePaths.forEach((path) => {
        const result = FilePathValidator.validatePath(path);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Absolute paths not allowed');
      });
    });

    it('should trim whitespace from paths', () => {
      const pathsWithWhitespace = ['  file.md  ', '\tfile.md\t', '\nfile.md\n', ' folder/file.md '];

      pathsWithWhitespace.forEach((path) => {
        const result = FilePathValidator.validatePath(path);
        expect(result.isValid).toBe(true);
      });
    });

    it('should handle edge cases with special characters', () => {
      const validSpecialChars = [
        'file.name.md',
        'file-name.md',
        'file_name.md',
        'file name.md',
        '文件.md',
        'file@example.md',
        'file#hash.md',
        'file%.md'
      ];

      validSpecialChars.forEach((path) => {
        const result = FilePathValidator.validatePath(path);
        expect(result.isValid).toBe(true);
      });
    });

    it('should handle complex valid nested paths', () => {
      const complexPaths = [
        'projects/2024/january/report.md',
        'user-docs/api/v1/endpoints.md',
        'blog/posts/2024-01-15/article.md',
        'content/pages/about/team.md'
      ];

      complexPaths.forEach((path) => {
        const result = FilePathValidator.validatePath(path);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject colon in Windows drive format but allow in filenames', () => {
      // These should be rejected (Windows drive format)
      const windowsDrivePaths = ['C:file.md', 'D:\\folder\\file.md'];

      windowsDrivePaths.forEach((path) => {
        const result = FilePathValidator.validatePath(path);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Absolute paths not allowed');
      });
    });
  });
});
