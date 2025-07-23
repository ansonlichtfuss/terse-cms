import { describe, expect, it } from 'vitest';

import { insertTextAtCursor, insertTextAtLineStart, wrapSelectedText } from '../utils';

describe('Editor Utils', () => {
  describe('insertTextAtCursor', () => {
    it('inserts text at cursor position', () => {
      const content = 'Hello world';
      const cursorPosition = { start: 6, end: 6 };
      const textToInsert = 'beautiful ';

      const result = insertTextAtCursor(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('Hello beautiful world');
      expect(result.newCursorPos).toBe(16); // 6 + 10 (length of "beautiful ")
    });

    it('replaces selected text at cursor position', () => {
      const content = 'Hello old world';
      const cursorPosition = { start: 6, end: 9 }; // "old"
      const textToInsert = 'new';

      const result = insertTextAtCursor(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('Hello new world');
      expect(result.newCursorPos).toBe(9); // 6 + 3 (length of "new")
    });

    it('handles cursor at start of content', () => {
      const content = 'world';
      const cursorPosition = { start: 0, end: 0 };
      const textToInsert = 'Hello ';

      const result = insertTextAtCursor(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('Hello world');
      expect(result.newCursorPos).toBe(6);
    });

    it('handles cursor at end of content', () => {
      const content = 'Hello';
      const cursorPosition = { start: 5, end: 5 };
      const textToInsert = ' world';

      const result = insertTextAtCursor(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('Hello world');
      expect(result.newCursorPos).toBe(11);
    });

    it('handles empty content', () => {
      const content = '';
      const cursorPosition = { start: 0, end: 0 };
      const textToInsert = 'Hello world';

      const result = insertTextAtCursor(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('Hello world');
      expect(result.newCursorPos).toBe(11);
    });

    it('handles empty text insertion', () => {
      const content = 'Hello world';
      const cursorPosition = { start: 6, end: 6 };
      const textToInsert = '';

      const result = insertTextAtCursor(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('Hello world');
      expect(result.newCursorPos).toBe(6);
    });
  });

  describe('insertTextAtLineStart', () => {
    it('inserts text at beginning of current line', () => {
      const content = 'First line\nSecond line\nThird line';
      const cursorPosition = { start: 15 }; // Middle of "Second line"
      const textToInsert = '> ';

      const result = insertTextAtLineStart(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('First line\n> Second line\nThird line');
      expect(result.newCursorPos).toBe(13); // Position after inserted text
    });

    it('inserts text at beginning of first line', () => {
      const content = 'Hello world';
      const cursorPosition = { start: 6 }; // Middle of line
      const textToInsert = '# ';

      const result = insertTextAtLineStart(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('# Hello world');
      expect(result.newCursorPos).toBe(2);
    });

    it('handles cursor at line start', () => {
      const content = 'First line\nSecond line';
      const cursorPosition = { start: 11 }; // Beginning of "Second line"
      const textToInsert = '- ';

      const result = insertTextAtLineStart(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('First line\n- Second line');
      expect(result.newCursorPos).toBe(13);
    });

    it('handles multiline content with cursor at end', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const cursorPosition = { start: 20 }; // End of "Line 3"
      const textToInsert = '## ';

      const result = insertTextAtLineStart(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('Line 1\nLine 2\n## Line 3');
      expect(result.newCursorPos).toBe(17);
    });

    it('handles empty content', () => {
      const content = '';
      const cursorPosition = { start: 0 };
      const textToInsert = '# ';

      const result = insertTextAtLineStart(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('# ');
      expect(result.newCursorPos).toBe(2);
    });

    it('handles content with only newlines', () => {
      const content = '\n\n\n';
      const cursorPosition = { start: 2 }; // Second newline
      const textToInsert = '> ';

      const result = insertTextAtLineStart(content, cursorPosition, textToInsert);

      expect(result.newContent).toBe('\n\n> \n');
      expect(result.newCursorPos).toBe(4);
    });
  });

  describe('wrapSelectedText', () => {
    it('wraps selected text with prefix and suffix', () => {
      const content = 'Make this bold';
      const cursorPosition = { start: 5, end: 9 }; // "this"
      const prefix = '**';
      const suffix = '**';
      const defaultText = 'text';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('Make **this** bold');
      expect(result.newCursorPos).toBe(11); // Position after wrapped text
    });

    it('uses default text when no text is selected', () => {
      const content = 'Hello world';
      const cursorPosition = { start: 6, end: 6 }; // No selection
      const prefix = '*';
      const suffix = '*';
      const defaultText = 'italic text';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('Hello *italic text*world');
      expect(result.newCursorPos).toBe(18); // Position after wrapped text
    });

    it('handles wrapping with different prefix and suffix', () => {
      const content = 'Link text here';
      const cursorPosition = { start: 0, end: 9 }; // "Link text"
      const prefix = '[';
      const suffix = '](url)';
      const defaultText = 'Link text';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('[Link text](url) here');
      expect(result.newCursorPos).toBe(10); // Position after wrapped text
    });

    it('handles code block wrapping', () => {
      const content = 'console.log("hello")';
      const cursorPosition = { start: 0, end: 20 }; // Entire content
      const prefix = '```\n';
      const suffix = '\n```';
      const defaultText = 'code';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('```\nconsole.log("hello")\n```');
      expect(result.newCursorPos).toBe(24); // Position after code content
    });

    it('handles empty selection at start', () => {
      const content = 'Hello world';
      const cursorPosition = { start: 0, end: 0 };
      const prefix = '**';
      const suffix = '**';
      const defaultText = 'bold text';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('**bold text**Hello world');
      expect(result.newCursorPos).toBe(11); // Position after "**bold text"
    });

    it('handles empty selection at end', () => {
      const content = 'Hello world';
      const cursorPosition = { start: 11, end: 11 };
      const prefix = '*';
      const suffix = '*';
      const defaultText = 'italic';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('Hello world*italic*');
      expect(result.newCursorPos).toBe(18); // Position after "*italic"
    });

    it('handles multiline selected text', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const cursorPosition = { start: 0, end: 13 }; // "Line 1\nLine 2"
      const prefix = '> ';
      const suffix = '';
      const defaultText = 'quote';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('> Line 1\nLine 2\nLine 3');
      expect(result.newCursorPos).toBe(15); // Position after wrapped text
    });

    it('handles empty content with default text', () => {
      const content = '';
      const cursorPosition = { start: 0, end: 0 };
      const prefix = '**';
      const suffix = '**';
      const defaultText = 'bold';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('**bold**');
      expect(result.newCursorPos).toBe(6); // Position after "**bold"
    });

    it('handles selection that spans entire content', () => {
      const content = 'entire content';
      const cursorPosition = { start: 0, end: 14 };
      const prefix = '_';
      const suffix = '_';
      const defaultText = 'text';

      const result = wrapSelectedText(content, cursorPosition, prefix, suffix, defaultText);

      expect(result.newContent).toBe('_entire content_');
      expect(result.newCursorPos).toBe(15); // Position after wrapped content
    });
  });
});
