import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TriviaApiError } from '../api/errors';
import { fetchCategories } from '../api/fetchCategories';
import type { Category } from '../types/quiz';
import { useCategories } from './useCategories';

vi.mock('../api/fetchCategories', () => ({ fetchCategories: vi.fn() }));

const mockFetchCategories = vi.mocked(fetchCategories);

const categories: Category[] = [
  { id: 9, name: 'General Knowledge' },
  { id: 21, name: 'Sports' },
];

describe('useCategories', () => {
  beforeEach(() => {
    mockFetchCategories.mockReset();
  });

  it('starts in the loading state', () => {
    mockFetchCategories.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCategories());

    expect(result.current).toEqual({ categories: [], loading: true, error: null });
  });

  it('returns the categories after a successful request', async () => {
    mockFetchCategories.mockResolvedValue(categories);

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ categories, loading: false, error: null });
  });

  it('requests the categories only once', async () => {
    mockFetchCategories.mockResolvedValue(categories);

    const { result, rerender } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender();

    expect(mockFetchCategories).toHaveBeenCalledTimes(1);
  });

  it('returns an error message when the request fails', async () => {
    mockFetchCategories.mockRejectedValue(new TriviaApiError('Offline', null));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Could not load categories.');
    expect(result.current.categories).toEqual([]);
  });

  it('ignores an abort error', async () => {
    mockFetchCategories.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const { result } = renderHook(() => useCategories());
    await act(async () => {});

    expect(result.current).toEqual({ categories: [], loading: true, error: null });
  });

  it('aborts the request when the component unmounts', () => {
    let receivedSignal: AbortSignal | undefined;
    mockFetchCategories.mockImplementation((signal) => {
      receivedSignal = signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useCategories());
    expect(receivedSignal?.aborted).toBe(false);

    unmount();

    expect(receivedSignal?.aborted).toBe(true);
  });
});
