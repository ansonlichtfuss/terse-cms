'use client';

import type React from 'react';

import { insertTextAtCursor, insertTextAtLineStart, wrapSelectedText } from '@/components/editor/utils';
import { Textarea } from '@/components/ui/textarea';

interface EditorContentProps {
  content: string;
  onChange: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function EditorContent({ content, onChange, textareaRef }: EditorContentProps) {
  // Handle content changes from user input
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={content}
      onChange={handleContentChange}
      className="w-full h-full min-h-[calc(100vh-12rem)] font-mono resize-none p-2 text-xs"
      placeholder="# Start writing your markdown here..."
    />
  );
}

// Export the cursor position type for use in other components
export type CursorPosition = { start: number; end: number };

// Export utility functions for manipulating text at cursor position
export function insertAtCursor(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  content: string,
  textToInsert: string,
  onChange: (content: string) => void
) {
  if (!textareaRef.current) return content;

  const textarea = textareaRef.current;
  const cursorPosition = { start: textarea.selectionStart, end: textarea.selectionEnd };

  const { newContent, newCursorPos } = insertTextAtCursor(content, cursorPosition, textToInsert);
  onChange(newContent);

  // Set the new cursor position after state update
  setTimeout(() => {
    if (textareaRef.current) {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
  }, 0);

  return newContent;
}

// Export utility function for toolbar actions
export function handleToolbarAction(
  action: string,
  value: string | undefined,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  content: string,
  onChange: (content: string) => void
) {
  if (!textareaRef.current) return content;

  const textarea = textareaRef.current;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.substring(start, end);

  let newContent = content;
  let newCursorPos = end;

  switch (action) {
    case 'heading':
      // Insert heading at the beginning of the line
      const { newContent: headingContent, newCursorPos: headingPos } = insertTextAtLineStart(
        content,
        { start },
        value || ''
      );
      newContent = headingContent;
      newCursorPos = headingPos;
      break;

    case 'bold':
      const { newContent: boldContent, newCursorPos: boldPos } = wrapSelectedText(
        content,
        { start, end },
        '**',
        '**',
        'bold text'
      );
      newContent = boldContent;
      newCursorPos = boldPos;
      break;

    case 'italic':
      const { newContent: italicContent, newCursorPos: italicPos } = wrapSelectedText(
        content,
        { start, end },
        '*',
        '*',
        'italic text'
      );
      newContent = italicContent;
      newCursorPos = italicPos;
      break;

    case 'list':
      const { newContent: listContent, newCursorPos: listPos } = wrapSelectedText(
        content,
        { start, end },
        '- ',
        '',
        'List item'
      );
      newContent = listContent;
      newCursorPos = listPos;
      break;

    case 'ordered-list':
      const { newContent: olContent, newCursorPos: olPos } = wrapSelectedText(
        content,
        { start, end },
        '1. ',
        '',
        'List item'
      );
      newContent = olContent;
      newCursorPos = olPos;
      break;

    case 'link':
      const { newContent: linkContent, newCursorPos: linkPos } = wrapSelectedText(
        content,
        { start, end },
        '[',
        '](url)',
        'Link text'
      );
      newContent = linkContent;
      newCursorPos = linkPos;
      break;

    case 'code':
      const { newContent: codeContent, newCursorPos: codePos } = wrapSelectedText(
        content,
        { start, end },
        '```\n',
        '\n```',
        'code'
      );
      newContent = codeContent;
      newCursorPos = codePos;
      break;

    case 'quote':
      // Insert quote at the beginning of the line
      const { newContent: quoteContent, newCursorPos: quotePos } = insertTextAtLineStart(content, { start }, '> ');
      newContent = quoteContent;
      newCursorPos = quotePos;
      break;

    case 'undo':
      textarea.focus();
      document.execCommand('undo');
      return content;

    case 'redo':
      textarea.focus();
      document.execCommand('redo');
      return content;
  }

  onChange(newContent);

  // Set the new cursor position after state update
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);

  return newContent;
}
