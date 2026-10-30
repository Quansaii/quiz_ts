import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TriviaApiError } from '../api/errors';
import { fetchQuestions } from '../api/fetchQuestions';
import { makeQuestion, makeSettings } from '../test/factories';
import type { GameState, Question, QuizSettings } from '../types/quiz';
import { useQuestions } from './useQuestions';

vi.mock('../api/fetchQuestions', () => ({ fetchQuestions: vi.fn() }));

const mockFetchQuestions = vi.mocked(fetchQuestions);
const settings = makeSettings({ amount: 3 });
const questions = [makeQuestion()];

interface Props {
  status: GameState['status'];
  settings: QuizSettings | null;
}

const loadingProps: Props = { status: 'loading', settings };

describe('useQuestions', () => {
  beforeEach(() => {
    mockFetchQuestions.mockReset();
  });

  it.each(['setup', 'question', 'error', 'finished'] as const)(
    'does not request anything in the %s status',
    async (status) => {
      const dispatch = vi.fn();

      renderHook(() => useQuestions(status, settings, dispatch));
      await act(async () => {});

      expect(mockFetchQuestions).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    },
  );

  it('does not request anything without settings', async () => {
    const dispatch = vi.fn();

    renderHook(() => useQuestions('loading', null, dispatch));
    await act(async () => {});

    expect(mockFetchQuestions).not.toHaveBeenCalled();
  });

  it('requests the questions in the loading status and dispatches LOADED', async () => {
    mockFetchQuestions.mockResolvedValue(questions);
    const dispatch = vi.fn();

    renderHook(() => useQuestions('loading', settings, dispatch));

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith({ type: 'LOADED', questions }));
    expect(mockFetchQuestions).toHaveBeenCalledWith(settings, expect.any(AbortSignal));
  });

  it('starts a request when the status changes to loading', async () => {
    mockFetchQuestions.mockResolvedValue(questions);
    const dispatch = vi.fn();
    const { rerender } = renderHook(({ status, settings }) => useQuestions(status, settings, dispatch), {
      initialProps: { status: 'setup', settings } as Props,
    });

    expect(mockFetchQuestions).not.toHaveBeenCalled();

    rerender(loadingProps);

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith({ type: 'LOADED', questions }));
    expect(mockFetchQuestions).toHaveBeenCalledTimes(1);
  });

  it('dispatches LOAD_FAILED with the message of a TriviaApiError', async () => {
    mockFetchQuestions.mockRejectedValue(new TriviaApiError('Too many requests.', 5));
    const dispatch = vi.fn();

    renderHook(() => useQuestions('loading', settings, dispatch));

    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith({ type: 'LOAD_FAILED', message: 'Too many requests.' }),
    );
  });

  it('dispatches LOAD_FAILED with a default message for unknown errors', async () => {
    mockFetchQuestions.mockRejectedValue(new Error('boom'));
    const dispatch = vi.fn();

    renderHook(() => useQuestions('loading', settings, dispatch));

    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith({ type: 'LOAD_FAILED', message: 'Could not load questions.' }),
    );
  });

  it('does not dispatch when the request is aborted', async () => {
    mockFetchQuestions.mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    const dispatch = vi.fn();

    renderHook(() => useQuestions('loading', settings, dispatch));
    await act(async () => {});

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('aborts the request and does not dispatch after unmount', async () => {
    let receivedSignal: AbortSignal | undefined;
    let resolveRequest: ((value: Question[]) => void) | undefined;
    mockFetchQuestions.mockImplementation((_settings, signal) => {
      receivedSignal = signal;
      return new Promise((resolve) => {
        resolveRequest = resolve;
      });
    });
    const dispatch = vi.fn();

    const { unmount } = renderHook(() => useQuestions('loading', settings, dispatch));
    unmount();

    expect(receivedSignal?.aborted).toBe(true);

    await act(async () => {
      resolveRequest?.(questions);
    });

    expect(dispatch).not.toHaveBeenCalled();
  });
});
