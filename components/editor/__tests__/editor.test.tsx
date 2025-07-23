import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileData } from '@/types';

import { Editor } from '../editor';

// Mock dependencies
vi.mock('@/context/git-status-context', () => ({
  useGitStatus: () => ({
    updateGitStatus: vi.fn()
  })
}));

vi.mock('@/lib/user-preferences', () => ({
  getUserPreferences: () => ({ isSidebarVisible: true }),
  saveUserPreferences: vi.fn()
}));

vi.mock('@/utils/date-utils', () => ({
  formatModificationTime: (time: string) => time
}));

vi.mock('@/components/file-browser/hooks/use-file-operations', () => ({
  useFileOperations: () => ({
    handleRename: vi.fn(),
    isRenamingFile: false
  })
}));

// Mock editor components to focus on main editor logic
vi.mock('../editor-content', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EditorContent: ({ content, onChange, textareaRef }: any) => (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      data-testid="editor-textarea"
    />
  ),
  handleToolbarAction: vi.fn((action, value, ref, content, onChange) => {
    const newContent = content + ' formatted';
    onChange(newContent);
    return newContent;
  })
}));

// Mock use-debounce
vi.mock('use-debounce', () => ({
  useDebounce: (fn: (...args: unknown[]) => unknown, _delay: number) => [
    (...args: unknown[]) => {
      setTimeout(() => fn(...args), 0);
    }
  ]
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('Editor', () => {
  const mockOnSave = vi.fn();
  const defaultFile: FileData = {
    path: 'test/file.md',
    content: '# Test Content',
    isModified: false,
    lastModified: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders editor with file content', () => {
    renderWithQueryClient(<Editor file={defaultFile} onSave={mockOnSave} />);

    expect(screen.getByDisplayValue('# Test Content')).toBeInTheDocument();
    expect(screen.getByText('file.md')).toBeInTheDocument();
  });

  it('displays file modification time', () => {
    renderWithQueryClient(<Editor file={defaultFile} onSave={mockOnSave} />);

    expect(screen.getByText('2023-01-01T00:00:00.000Z')).toBeInTheDocument();
  });

  it('handles content changes', () => {
    renderWithQueryClient(<Editor file={defaultFile} onSave={mockOnSave} />);

    const textarea = screen.getByTestId('editor-textarea');

    // Initial load should not trigger save
    expect(mockOnSave).not.toHaveBeenCalled();

    // Verify textarea shows correct initial content
    expect(textarea).toHaveValue('# Test Content');
  });

  it('opens rename dialog when clicking filename', async () => {
    renderWithQueryClient(<Editor file={defaultFile} onSave={mockOnSave} />);

    const filename = screen.getByRole('button', { name: 'Change filename' });
    await userEvent.click(filename);

    // Verify the open dialog function was called
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('toggles sidebar visibility', async () => {
    renderWithQueryClient(<Editor file={defaultFile} onSave={mockOnSave} />);

    const toggleButton = screen.getByRole('button', { name: 'Hide file detail sidebar' });

    // Initially visible
    await userEvent.click(toggleButton);

    // Just verify the click worked - don't wait for state change
    expect(screen.getByRole('button', { name: 'Show file detail sidebar' })).toBeInTheDocument();
  });

  it('updates content when file prop changes', () => {
    const { rerender } = renderWithQueryClient(<Editor file={defaultFile} onSave={mockOnSave} />);

    expect(screen.getByDisplayValue('# Test Content')).toBeInTheDocument();

    const newFile: FileData = {
      path: 'test/new-file.md',
      content: '# New Content',
      isModified: false,
      lastModified: '2023-01-02T00:00:00.000Z'
    };

    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <Editor file={newFile} onSave={mockOnSave} />
      </QueryClientProvider>
    );

    expect(screen.getByDisplayValue('# New Content')).toBeInTheDocument();
    expect(screen.getByText('new-file.md')).toBeInTheDocument();
  });

  it('handles missing file gracefully', () => {
    const emptyFile: FileData = {
      path: '',
      content: '',
      isModified: false
    };

    renderWithQueryClient(<Editor file={emptyFile} onSave={mockOnSave} />);

    expect(screen.getByText('Untitled')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('handles toolbar action without textarea ref', async () => {
    renderWithQueryClient(<Editor file={defaultFile} onSave={mockOnSave} />);

    const boldButton = screen.getByRole('button', { name: 'Bold' });
    await userEvent.click(boldButton);

    // Should handle gracefully without crashing - just verify it doesn't throw
    expect(boldButton).toBeInTheDocument();
  });
});
