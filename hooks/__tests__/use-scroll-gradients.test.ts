import { renderHook } from '@testing-library/react';
import { useScrollGradients } from '../use-scroll-gradients';

describe('useScrollGradients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useScrollGradients('horizontal'));
    
    expect(result.current.showStartGradient).toBe(false);
    expect(result.current.showEndGradient).toBe(false);
    expect(result.current.scrollContainerRef.current).toBe(null);
  });

  it('should return a ref object', () => {
    const { result } = renderHook(() => useScrollGradients('horizontal'));
    
    expect(result.current.scrollContainerRef).toBeDefined();
    expect(typeof result.current.scrollContainerRef).toBe('object');
  });

  it('should accept horizontal direction', () => {
    const { result } = renderHook(() => useScrollGradients('horizontal'));
    
    expect(result.current.showStartGradient).toBe(false);
    expect(result.current.showEndGradient).toBe(false);
  });

  it('should accept vertical direction', () => {
    const { result } = renderHook(() => useScrollGradients('vertical'));
    
    expect(result.current.showStartGradient).toBe(false);
    expect(result.current.showEndGradient).toBe(false);
  });

  it('should accept dependencies array', () => {
    const dependencies = ['dep1', 'dep2'];
    const { result } = renderHook(() => useScrollGradients('horizontal', dependencies));
    
    expect(result.current.showStartGradient).toBe(false);
    expect(result.current.showEndGradient).toBe(false);
  });

  it('should default to horizontal direction when no direction provided', () => {
    const { result } = renderHook(() => useScrollGradients());
    
    expect(result.current.showStartGradient).toBe(false);
    expect(result.current.showEndGradient).toBe(false);
    expect(result.current.scrollContainerRef.current).toBe(null);
  });

  it('should handle empty dependencies array', () => {
    const { result } = renderHook(() => useScrollGradients('horizontal', []));
    
    expect(result.current.showStartGradient).toBe(false);
    expect(result.current.showEndGradient).toBe(false);
  });

  it('should return consistent interface for both directions', () => {
    const { result: horizontalResult } = renderHook(() => useScrollGradients('horizontal'));
    const { result: verticalResult } = renderHook(() => useScrollGradients('vertical'));
    
    expect(Object.keys(horizontalResult.current)).toEqual(Object.keys(verticalResult.current));
    expect(horizontalResult.current).toHaveProperty('showStartGradient');
    expect(horizontalResult.current).toHaveProperty('showEndGradient');
    expect(horizontalResult.current).toHaveProperty('scrollContainerRef');
    expect(verticalResult.current).toHaveProperty('showStartGradient');
    expect(verticalResult.current).toHaveProperty('showEndGradient');
    expect(verticalResult.current).toHaveProperty('scrollContainerRef');
  });
});