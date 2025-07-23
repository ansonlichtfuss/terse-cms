import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditorContent, handleToolbarAction, insertAtCursor } from '../editor-content';

// Mock document.execCommand
Object.defineProperty(document, 'execCommand', {
  value: vi.fn()
});

// Test wrapper component to provide ref and manage state properly
function TestWrapper({ content: initialContent = '', onChange = vi.fn() }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(initialContent);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  return <EditorContent content={content} onChange={handleChange} textareaRef={textareaRef} />;
}

describe('EditorContent', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea with correct props', () => {
    render(<TestWrapper content="Test content" onChange={mockOnChange} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test content');
    expect(textarea).toHaveAttribute('placeholder', '# Start writing your markdown here...');
  });

  it('calls onChange when content changes', async () => {
    const user = userEvent.setup();

    render(<TestWrapper content="" onChange={mockOnChange} />);

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'New');

    // Verify onChange is called (exact number of calls may vary)
    expect(mockOnChange).toHaveBeenCalled();
    // userEvent.type calls onChange for each character, so final call has the complete text
    const calls = mockOnChange.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    // Check that the textarea has the correct final value
    expect(textarea).toHaveValue('New');
  });

  describe('insertAtCursor', () => {
    it('inserts text at cursor position', () => {
      const textareaRef = { current: document.createElement('textarea') };
      textareaRef.current.selectionStart = 5;
      textareaRef.current.selectionEnd = 5;

      const result = insertAtCursor(textareaRef, 'Hello world', ' beautiful', mockOnChange);

      // Verify the function works and onChange is called
      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('beautiful')).toBe(true);
    });

    it('sets cursor position after insertion', () => {
      vi.useFakeTimers();
      const textarea = document.createElement('textarea');

      // Mock the methods properly
      const focusMock = vi.fn();
      const setSelectionRangeMock = vi.fn();

      Object.defineProperty(textarea, 'focus', { value: focusMock });
      Object.defineProperty(textarea, 'setSelectionRange', { value: setSelectionRangeMock });
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;

      const textareaRef = { current: textarea };

      insertAtCursor(textareaRef, 'Hello', ' world', mockOnChange);

      // Fast-forward the setTimeout
      vi.advanceTimersByTime(1);

      expect(focusMock).toHaveBeenCalled();
      expect(setSelectionRangeMock).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('handleToolbarAction', () => {
    let textareaRef: { current: HTMLTextAreaElement };
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
      textarea = document.createElement('textarea');

      // Mock the methods properly
      const focusMock = vi.fn();
      const setSelectionRangeMock = vi.fn();

      Object.defineProperty(textarea, 'focus', { value: focusMock });
      Object.defineProperty(textarea, 'setSelectionRange', { value: setSelectionRangeMock });
      textarea.selectionStart = 0;
      textarea.selectionEnd = 4; // Select "text"
      textareaRef = { current: textarea };
    });

    it('handles heading action', () => {
      const result = handleToolbarAction('heading', '# ', textareaRef, 'Content', mockOnChange);

      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('#')).toBe(true);
    });

    it('handles bold action', () => {
      const result = handleToolbarAction('bold', undefined, textareaRef, 'text', mockOnChange);

      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('**')).toBe(true);
    });

    it('handles italic action', () => {
      const result = handleToolbarAction('italic', undefined, textareaRef, 'text', mockOnChange);

      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('*')).toBe(true);
    });

    it('handles list action', () => {
      const result = handleToolbarAction('list', undefined, textareaRef, 'Item', mockOnChange);

      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('- ')).toBe(true);
    });

    it('handles ordered-list action', () => {
      const result = handleToolbarAction('ordered-list', undefined, textareaRef, 'Item', mockOnChange);

      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('1. ')).toBe(true);
    });

    it('handles link action', () => {
      const result = handleToolbarAction('link', undefined, textareaRef, 'text', mockOnChange);

      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('[') && result.includes('](url)')).toBe(true);
    });

    it('handles code action', () => {
      const result = handleToolbarAction('code', undefined, textareaRef, 'code', mockOnChange);

      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('```')).toBe(true);
    });

    it('handles quote action', () => {
      const result = handleToolbarAction('quote', undefined, textareaRef, 'Quote text', mockOnChange);

      expect(mockOnChange).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result.includes('> ')).toBe(true);
    });

    it('handles undo action', () => {
      const result = handleToolbarAction('undo', undefined, textareaRef, 'content', mockOnChange);

      expect(textarea.focus).toHaveBeenCalled();
      expect(result).toBe('content');
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('handles redo action', () => {
      const result = handleToolbarAction('redo', undefined, textareaRef, 'content', mockOnChange);

      expect(textarea.focus).toHaveBeenCalled();
      expect(result).toBe('content');
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('handles null textarea ref', () => {
      const result = handleToolbarAction('bold', undefined, { current: null }, 'content', mockOnChange);

      expect(result).toBe('content');
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('sets cursor position after toolbar action', () => {
      vi.useFakeTimers();

      handleToolbarAction('bold', undefined, textareaRef, 'text', mockOnChange);

      // Fast-forward the setTimeout
      vi.advanceTimersByTime(1);

      expect(textarea.focus).toHaveBeenCalled();
      expect(textarea.setSelectionRange).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
