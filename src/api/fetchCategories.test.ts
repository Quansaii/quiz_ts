import { beforeEach, describe, expect, it, vi } from 'vitest';
import { brokenJsonResponse, fakeResponse } from '../test/factories';
import { TriviaApiError } from './errors';
import { fetchCategories } from './fetchCategories';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('fetchCategories', () => {
  it('requests the category endpoint and passes the abort signal', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ trivia_categories: [] }));
    const controller = new AbortController();

    await fetchCategories(controller.signal);

    expect(fetchMock).toHaveBeenCalledWith('https://opentdb.com/api_category.php', {
      signal: controller.signal,
    });
  });

  it('returns the categories with id and name', async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        trivia_categories: [
          { id: 9, name: 'General Knowledge' },
          { id: 21, name: 'Sports' },
        ],
      }),
    );

    await expect(fetchCategories()).resolves.toEqual([
      { id: 9, name: 'General Knowledge' },
      { id: 21, name: 'Sports' },
    ]);
  });

  it('throws a TriviaApiError with a null code when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const promise = fetchCategories();

    await expect(promise).rejects.toBeInstanceOf(TriviaApiError);
    await expect(promise).rejects.toMatchObject({ code: null });
  });

  it('rethrows an abort error unchanged', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValue(abortError);

    await expect(fetchCategories()).rejects.toBe(abortError);
  });

  it('throws a TriviaApiError with the status for a failed http response', async () => {
    fetchMock.mockResolvedValue(fakeResponse({}, { ok: false, status: 503 }));

    await expect(fetchCategories()).rejects.toMatchObject({ code: 503 });
  });

  it('throws a TriviaApiError with a null code when the body is not valid json', async () => {
    fetchMock.mockResolvedValue(brokenJsonResponse());

    const promise = fetchCategories();

    await expect(promise).rejects.toBeInstanceOf(TriviaApiError);
    await expect(promise).rejects.toMatchObject({ code: null });
  });
});
