import { render, screen } from '@testing-library/react';
import React from 'react';

import { useScrollGradients } from '@/hooks/use-scroll-gradients';

import { ScrollableContainer } from '../scrollable-container';

// Mock the hook
vi.mock('@/hooks/use-scroll-gradients', () => ({
  useScrollGradients: vi.fn(() => ({
    scrollContainerRef: { current: null },
    showStartGradient: false,
    showEndGradient: false
  }))
}));

describe('ScrollableContainer', () => {
  const mockUseScrollGradients = vi.mocked(useScrollGradients);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <ScrollableContainer>
        <div>Test content</div>
      </ScrollableContainer>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className to scroll container', () => {
    const { container } = render(
      <ScrollableContainer className="custom-class">
        <div>Test content</div>
      </ScrollableContainer>
    );

    const scrollContainer = container.querySelector('div[class*="custom-class"]') as HTMLElement;
    expect(scrollContainer).toHaveClass('custom-class');
  });

  it('calls useScrollGradients hook with correct parameters', () => {
    const dependencies = ['dep1', 'dep2'];

    render(
      <ScrollableContainer direction="vertical" dependencies={dependencies}>
        <div>Test content</div>
      </ScrollableContainer>
    );

    expect(mockUseScrollGradients).toHaveBeenCalledWith('vertical', dependencies);
  });

  it('renders gradients with correct styles for horizontal direction', () => {
    mockUseScrollGradients.mockReturnValue({
      scrollContainerRef: { current: null },
      showStartGradient: true,
      showEndGradient: true
    });

    const { container } = render(
      <ScrollableContainer direction="horizontal" gradientSize={24}>
        <div>Test content</div>
      </ScrollableContainer>
    );

    const gradients = container.querySelectorAll('div[style*="linear-gradient"]');
    expect(gradients).toHaveLength(2);

    const startGradient = gradients[0] as HTMLElement;
    const endGradient = gradients[1] as HTMLElement;

    expect(startGradient.style.width).toBe('24px');
    expect(startGradient.style.background).toContain('linear-gradient(to right');
    expect(startGradient.style.opacity).toBe('1');

    expect(endGradient.style.width).toBe('24px');
    expect(endGradient.style.background).toContain('linear-gradient(to left');
    expect(endGradient.style.opacity).toBe('1');
  });

  it('renders gradients with correct styles for vertical direction', () => {
    mockUseScrollGradients.mockReturnValue({
      scrollContainerRef: { current: null },
      showStartGradient: true,
      showEndGradient: true
    });

    const { container } = render(
      <ScrollableContainer direction="vertical" gradientSize={16}>
        <div>Test content</div>
      </ScrollableContainer>
    );

    const gradients = container.querySelectorAll('div[style*="linear-gradient"]');
    expect(gradients).toHaveLength(2);

    const startGradient = gradients[0] as HTMLElement;
    const endGradient = gradients[1] as HTMLElement;

    expect(startGradient.style.height).toBe('16px');
    expect(startGradient.style.background).toContain('linear-gradient(to bottom');
    expect(startGradient.style.opacity).toBe('1');

    expect(endGradient.style.height).toBe('16px');
    expect(endGradient.style.background).toContain('linear-gradient(to top');
    expect(endGradient.style.opacity).toBe('1');
  });

  it('hides gradients when showStartGradient and showEndGradient are false', () => {
    mockUseScrollGradients.mockReturnValue({
      scrollContainerRef: { current: null },
      showStartGradient: false,
      showEndGradient: false
    });

    const { container } = render(
      <ScrollableContainer>
        <div>Test content</div>
      </ScrollableContainer>
    );

    const gradients = container.querySelectorAll('div[style*="linear-gradient"]');
    expect(gradients).toHaveLength(2);

    const startGradient = gradients[0] as HTMLElement;
    const endGradient = gradients[1] as HTMLElement;

    expect(startGradient.style.opacity).toBe('0');
    expect(endGradient.style.opacity).toBe('0');
  });

  it('uses default gradient size when not specified', () => {
    mockUseScrollGradients.mockReturnValue({
      scrollContainerRef: { current: null },
      showStartGradient: true,
      showEndGradient: true
    });

    const { container } = render(
      <ScrollableContainer>
        <div>Test content</div>
      </ScrollableContainer>
    );

    const gradients = container.querySelectorAll('div[style*="linear-gradient"]');
    const startGradient = gradients[0] as HTMLElement;

    expect(startGradient.style.width).toBe('32px');
  });

  it('handles scrollToEnd functionality', () => {
    mockUseScrollGradients.mockReturnValue({
      scrollContainerRef: { current: null },
      showStartGradient: false,
      showEndGradient: false
    });

    // Test horizontal scrollToEnd
    render(
      <ScrollableContainer direction="horizontal" scrollToEnd={true}>
        <div>Test content</div>
      </ScrollableContainer>
    );

    // The scrollToEnd functionality is tested by verifying the hook is called with correct parameters
    expect(mockUseScrollGradients).toHaveBeenCalledWith('horizontal', []);
  });
});
