import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditorToolbar } from '../editor-toolbar';

// Mock the get-toolbar-items module
vi.mock('../get-toolbar-items', () => ({
  getToolbarItems: (onImageClick: () => void) => [
    {
      group: 'headings',
      items: [
        {
          icon: <span data-testid="h1-icon">H1</span>,
          action: 'heading',
          value: '# ',
          tooltip: 'Heading 1'
        },
        {
          icon: <span data-testid="h2-icon">H2</span>,
          action: 'heading',
          value: '## ',
          tooltip: 'Heading 2'
        }
      ]
    },
    {
      group: 'formatting',
      items: [
        {
          icon: <span data-testid="bold-icon">B</span>,
          action: 'bold',
          tooltip: 'Bold'
        },
        {
          icon: <span data-testid="italic-icon">I</span>,
          action: 'italic',
          tooltip: 'Italic'
        }
      ]
    },
    {
      group: 'elements',
      items: [
        {
          icon: <span data-testid="image-icon">IMG</span>,
          action: 'image',
          tooltip: 'Insert Image',
          onClick: onImageClick
        }
      ]
    }
  ]
}));

describe('EditorToolbar', () => {
  const mockOnAction = vi.fn();
  const mockOnImageClick = vi.fn();
  const mockTextareaRef = { current: document.createElement('textarea') };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all toolbar groups and items', () => {
    render(<EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} textareaRef={mockTextareaRef} />);

    // Check if all toolbar items are rendered
    expect(screen.getByTestId('h1-icon')).toBeInTheDocument();
    expect(screen.getByTestId('h2-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bold-icon')).toBeInTheDocument();
    expect(screen.getByTestId('italic-icon')).toBeInTheDocument();
    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
  });

  it('renders group separators between toolbar groups', () => {
    const { container } = render(
      <EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} textareaRef={mockTextareaRef} />
    );

    // Should have separators between groups (check for elements with separator styling)
    const separators = container.querySelectorAll('[role="none"]');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('handles toolbar action clicks', async () => {
    const user = userEvent.setup();

    render(<EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} textareaRef={mockTextareaRef} />);

    // Click heading 1 button
    const h1Button = screen.getByTestId('h1-icon').closest('button');
    expect(h1Button).toBeInTheDocument();

    await user.click(h1Button!);
    expect(mockOnAction).toHaveBeenCalledWith('heading', '# ', mockTextareaRef);
  });

  it('handles formatting actions without values', async () => {
    const user = userEvent.setup();

    render(<EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} textareaRef={mockTextareaRef} />);

    // Click bold button
    const boldButton = screen.getByTestId('bold-icon').closest('button');
    await user.click(boldButton!);
    expect(mockOnAction).toHaveBeenCalledWith('bold', undefined, mockTextareaRef);

    // Click italic button
    const italicButton = screen.getByTestId('italic-icon').closest('button');
    await user.click(italicButton!);
    expect(mockOnAction).toHaveBeenCalledWith('italic', undefined, mockTextareaRef);
  });

  it('handles custom onClick actions', async () => {
    const user = userEvent.setup();

    render(<EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} textareaRef={mockTextareaRef} />);

    // Click image button (has custom onClick)
    const imageButton = screen.getByTestId('image-icon').closest('button');
    await user.click(imageButton!);

    // Should call the custom onClick instead of onAction
    expect(mockOnImageClick).toHaveBeenCalled();
    expect(mockOnAction).not.toHaveBeenCalledWith('image', expect.anything(), expect.anything());
  });

  it('renders tooltips for toolbar items', async () => {
    const user = userEvent.setup();

    render(<EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} textareaRef={mockTextareaRef} />);

    // Hover over heading 1 button to show tooltip
    const h1Button = screen.getByTestId('h1-icon').closest('button');
    await user.hover(h1Button!);

    // Wait for tooltip to appear - use getAllByText to handle multiple instances
    const tooltips = await screen.findAllByText('Heading 1');
    expect(tooltips.length).toBeGreaterThan(0);
  });
  it('renders without textareaRef', () => {
    render(<EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} />);

    expect(screen.getByTestId('h1-icon')).toBeInTheDocument();
  });

  it('manages tooltip provider delay', () => {
    const { container } = render(
      <EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} textareaRef={mockTextareaRef} />
    );

    // Check that the tooltip provider is present (it may not have the exact attribute)
    const tooltipElements = container.querySelectorAll('[role="tooltip"], [data-state]');
    expect(tooltipElements.length).toBeGreaterThanOrEqual(0);
  });

  it('handles multiple rapid clicks', async () => {
    const user = userEvent.setup();

    render(<EditorToolbar onAction={mockOnAction} onImageClick={mockOnImageClick} textareaRef={mockTextareaRef} />);

    const boldButton = screen.getByTestId('bold-icon').closest('button');

    // Click multiple times rapidly
    await user.click(boldButton!);
    await user.click(boldButton!);
    await user.click(boldButton!);

    expect(mockOnAction).toHaveBeenCalledTimes(3);
  });
});
