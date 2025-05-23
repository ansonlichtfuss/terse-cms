// Helper function to insert text at cursor position
export function insertTextAtCursor(
  content: string,
  cursorPosition: { start: number; end: number },
  textToInsert: string
): { newContent: string; newCursorPos: number } {
  const { start, end } = cursorPosition;
  const newContent = content.substring(0, start) + textToInsert + content.substring(end);
  const newCursorPos = start + textToInsert.length;

  return { newContent, newCursorPos };
}

// Helper function to insert text at the beginning of the line
export function insertTextAtLineStart(
  content: string,
  cursorPosition: { start: number },
  textToInsert: string
): { newContent: string; newCursorPos: number } {
  const { start } = cursorPosition;
  const lineStart = content.lastIndexOf('\n', start - 1) + 1;
  const newContent = content.substring(0, lineStart) + textToInsert + content.substring(lineStart);
  const newCursorPos = lineStart + textToInsert.length;

  return { newContent, newCursorPos };
}

// Helper function to wrap selected text
export function wrapSelectedText(
  content: string,
  cursorPosition: { start: number; end: number },
  prefix: string,
  suffix: string,
  defaultText: string
): { newContent: string; newCursorPos: number } {
  const { start, end } = cursorPosition;
  const selectedText = content.substring(start, end);
  const textToInsert = selectedText || defaultText;
  const newContent = content.substring(0, start) + prefix + textToInsert + suffix + content.substring(end);
  const newCursorPos = start + prefix.length + textToInsert.length;

  return { newContent, newCursorPos };
}
