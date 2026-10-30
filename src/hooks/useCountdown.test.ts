import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from './useCountdown';

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('starts with the given number of seconds', () => {
    const { result } = renderHook(() => useCountdown(5, true, vi.fn()));

    expect(result.current).toBe(5);
  });

  it('decreases by one every second while active', () => {
    const { result } = renderHook(() => useCountdown(5, true, vi.fn()));

    advance(1000);
    expect(result.current).toBe(4);

    advance(2000);
    expect(result.current).toBe(2);
  });

  it('does not tick while inactive', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown(5, false, onExpire));

    advance(10000);

    expect(result.current).toBe(5);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('stops ticking when it becomes inactive', () => {
    const { result, rerender } = renderHook(({ active }) => useCountdown(5, active, vi.fn()), {
      initialProps: { active: true },
    });

    advance(2000);
    expect(result.current).toBe(3);

    rerender({ active: false });
    advance(3000);

    expect(result.current).toBe(3);
  });

  it('calls onExpire exactly once when it reaches zero', () => {
    const onExpire = vi.fn();
    renderHook(() => useCountdown(2, true, onExpire));

    advance(1000);
    expect(onExpire).not.toHaveBeenCalled();

    advance(1000);
    expect(onExpire).toHaveBeenCalledTimes(1);

    advance(5000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('never goes below zero', () => {
    const { result } = renderHook(() => useCountdown(2, true, vi.fn()));

    advance(10000);

    expect(result.current).toBe(0);
  });

  it('does not call onExpire when it is stopped before reaching zero', () => {
    const onExpire = vi.fn();
    const { rerender } = renderHook(({ active }) => useCountdown(3, active, onExpire), {
      initialProps: { active: true },
    });

    advance(1000);
    rerender({ active: false });
    advance(10000);

    expect(onExpire).not.toHaveBeenCalled();
  });

  it('calls the latest onExpire without restarting the interval', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ callback }) => useCountdown(2, true, callback), {
      initialProps: { callback: first },
    });

    advance(1000);
    rerender({ callback: second });
    advance(1000);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
