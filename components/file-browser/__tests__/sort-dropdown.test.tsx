import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SortDropdown } from '../sort-dropdown';
import type { SortConfig } from '../types/sorting';

// Mock the UI components with better state management
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({
    children,
    open,
    onOpenChange: _onOpenChange
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="dropdown-menu" data-open={open}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, role, ...props }: { children: React.ReactNode; role?: string }) => (
    <div data-testid="dropdown-content" role={role} {...props}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuRadioGroup: ({
    children,
    value,
    onValueChange
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <div
      data-testid="radio-group"
      data-value={value}
      onClick={(e: React.MouseEvent) => {
        const target = (e.target as Element).closest('[data-value]');
        if (target && onValueChange) {
          onValueChange(target.getAttribute('data-value') || '');
        }
      }}
    >
      {children}
    </div>
  ),
  DropdownMenuRadioItem: ({
    children,
    value,
    className
  }: {
    children: React.ReactNode;
    value: string;
    className?: string;
  }) => (
    <div data-testid={`radio-item-${value}`} data-value={value} className={className}>
      {children}
    </div>
  ),
  DropdownMenuCheckboxItem: ({
    children,
    checked,
    onCheckedChange,
    ...props
  }: {
    children: React.ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <div data-testid="checkbox-item" data-checked={checked} onClick={() => onCheckedChange?.(!checked)} {...props}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <div data-testid="separator" />
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>
}));

vi.mock('lucide-react', () => ({
  ArrowUpDown: () => <span data-testid="arrow-up-down-icon">↕</span>,
  ChevronUp: () => <span data-testid="chevron-up-icon">↑</span>,
  ChevronDown: () => <span data-testid="chevron-down-icon">↓</span>
}));

describe('SortDropdown', () => {
  const defaultSortConfig: SortConfig = {
    field: 'name',
    direction: 'asc',
    foldersFirst: false
  };

  const mockOnSortChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sort button with correct icon', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      expect(screen.getByTestId('arrow-up-down-icon')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort options')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <SortDropdown
          sortConfig={defaultSortConfig}
          onSortChange={mockOnSortChange}
          type="files"
          className="custom-class"
        />
      );

      const button = screen.getByLabelText('Sort options');
      expect(button).toHaveClass('custom-class');
    });

    it('should render dropdown menu content', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      expect(screen.getByText('Sort by')).toBeInTheDocument();
    });

    it('should render all sort field options', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      expect(screen.getByTestId('radio-item-name')).toBeInTheDocument();
      expect(screen.getByTestId('radio-item-lastModified')).toBeInTheDocument();
    });

    it('should render folders-first checkbox', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      expect(screen.getByTestId('checkbox-item')).toBeInTheDocument();
      expect(screen.getByText('Show folders first')).toBeInTheDocument();
    });
  });

  describe('Sort Field Selection', () => {
    it('should call onSortChange when sort field is selected', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      const lastModifiedOption = screen.getByTestId('radio-item-lastModified');
      fireEvent.click(lastModifiedOption);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'lastModified',
        direction: 'asc',
        foldersFirst: false
      });
    });

    it('should highlight currently selected sort field', () => {
      const sortConfig: SortConfig = {
        field: 'lastModified',
        direction: 'desc',
        foldersFirst: true
      };

      render(<SortDropdown sortConfig={sortConfig} onSortChange={mockOnSortChange} type="files" />);

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('data-value', 'lastModified');
    });
  });

  describe('Direction Toggle Buttons', () => {
    it('should render ascending and descending buttons for each field', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      const upIcons = screen.getAllByTestId('chevron-up-icon');
      const downIcons = screen.getAllByTestId('chevron-down-icon');

      expect(upIcons).toHaveLength(2);
      expect(downIcons).toHaveLength(2);
    });

    it('should call onSortChange when ascending button is clicked', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      const ascButton = screen.getByLabelText('Sort name ascending');
      fireEvent.click(ascButton);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
        foldersFirst: false
      });
    });

    it('should call onSortChange when descending button is clicked', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      const descButton = screen.getByLabelText('Sort name descending');
      fireEvent.click(descButton);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'desc',
        foldersFirst: false
      });
    });
  });

  describe('Folders-First Checkbox', () => {
    it('should call onSortChange when folders-first checkbox is toggled', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      const checkbox = screen.getByTestId('checkbox-item');
      fireEvent.click(checkbox);

      expect(mockOnSortChange).toHaveBeenCalledWith({
        field: 'name',
        direction: 'asc',
        foldersFirst: true
      });
    });

    it('should reflect current folders-first state', () => {
      const sortConfig: SortConfig = {
        field: 'name',
        direction: 'asc',
        foldersFirst: true
      };

      render(<SortDropdown sortConfig={sortConfig} onSortChange={mockOnSortChange} type="files" />);

      const checkbox = screen.getByTestId('checkbox-item');
      expect(checkbox).toHaveAttribute('data-checked', 'true');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels on sort button', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      const button = screen.getByLabelText('Sort options');
      expect(button).toHaveAttribute('aria-label', 'Sort options');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should have proper role on dropdown content', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveAttribute('role', 'menu');
      expect(content).toHaveAttribute('aria-label', 'Sort options menu');
    });

    it('should have proper ARIA labels on direction buttons', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);

      expect(screen.getByLabelText('Sort name ascending')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort name descending')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort date modified ascending')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort date modified descending')).toBeInTheDocument();
    });
  });

  describe('Browser Type Support', () => {
    it('should work with files browser type', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="files" />);
      expect(screen.getByLabelText('Sort options')).toBeInTheDocument();
    });

    it('should work with media browser type', () => {
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={mockOnSortChange} type="media" />);
      expect(screen.getByLabelText('Sort options')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onSortChange gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<SortDropdown sortConfig={defaultSortConfig} onSortChange={undefined as any} type="files" />);

      const lastModifiedOption = screen.getByTestId('radio-item-lastModified');
      expect(() => fireEvent.click(lastModifiedOption)).not.toThrow();
    });

    it('should handle invalid sort config gracefully', () => {
      const invalidConfig = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        field: 'invalid' as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        direction: 'invalid' as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        foldersFirst: 'invalid' as any
      };

      expect(() => {
        render(<SortDropdown sortConfig={invalidConfig} onSortChange={mockOnSortChange} type="files" />);
      }).not.toThrow();
    });
  });
});
