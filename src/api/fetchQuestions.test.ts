import { beforeEach, describe, expect, it, vi } from 'vitest';
import { brokenJsonResponse, fakeResponse, makeApiQuestion, makeSettings } from '../test/factories';
import { TriviaApiError } from './errors';
import { fetchQuestions } from './fetchQuestions';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('fetchQuestions', () => {
  it('requests the url built from the settings and passes the abort signal', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ response_code: 0, results: [makeApiQuestion()] }));
    const controller = new AbortController();

    await fetchQuestions(makeSettings({ amount: 3, categoryId: 9 }), controller.signal);

    expect(fetchMock).toHaveBeenCalledWith('https://opentdb.com/api.php?amount=3&category=9', {
      signal: controller.signal,
    });
  });

  it('converts the api questions into app questions', async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        response_code: 0,
        results: [
          makeApiQuestion({
            question: 'Who said &quot;Hi&quot;?',
            correct_answer: 'Tom &amp; Jerry',
            incorrect_answers: ['A', 'B', 'C'],
          }),
          makeApiQuestion({ difficulty: 'hard', category: 'Science' }),
        ],
      }),
    );

    const questions = await fetchQuestions(makeSettings());

    expect(questions).toHaveLength(2);
    expect(questions[0]?.id).toBe('0');
    expect(questions[0]?.text).toBe('Who said "Hi"?');
    expect(questions[0]?.answers).toHaveLength(4);
    expect(questions[0]?.answers.filter((answer) => answer.isCorrect)).toEqual([
      { text: 'Tom & Jerry', isCorrect: true },
    ]);
    expect(questions[1]).toMatchObject({ id: '1', difficulty: 'hard', category: 'Science' });
  });

  it('returns an empty list when the api returns no results with code 0', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ response_code: 0, results: [] }));

    await expect(fetchQuestions(makeSettings())).resolves.toEqual([]);
  });

  it('throws a TriviaApiError with a null code when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const promise = fetchQuestions(makeSettings());

    await expect(promise).rejects.toBeInstanceOf(TriviaApiError);
    await expect(promise).rejects.toMatchObject({ code: null });
  });

  it('rethrows an abort error unchanged', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValue(abortError);

    await expect(fetchQuestions(makeSettings())).rejects.toBe(abortError);
  });

  it('throws a TriviaApiError with the status for a failed http response', async () => {
    fetchMock.mockResolvedValue(fakeResponse({}, { ok: false, status: 500 }));

    const promise = fetchQuestions(makeSettings());

    await expect(promise).rejects.toBeInstanceOf(TriviaApiError);
    await expect(promise).rejects.toMatchObject({ code: 500 });
  });

  it('throws a TriviaApiError with a null code when the body is not valid json', async () => {
    fetchMock.mockResolvedValue(brokenJsonResponse());

    const promise = fetchQuestions(makeSettings());

    await expect(promise).rejects.toBeInstanceOf(TriviaApiError);
    await expect(promise).rejects.toMatchObject({ code: null });
  });

  it('reports api code 1 (no results)', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ response_code: 1, results: [] }));

    await expect(fetchQuestions(makeSettings())).rejects.toMatchObject({
      code: 1,
      message: expect.stringContaining('No questions'),
    });
  });

  it('reports api code 5 (rate limit)', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ response_code: 5, results: [] }));

    await expect(fetchQuestions(makeSettings())).rejects.toMatchObject({
      code: 5,
      message: expect.stringContaining('Too many requests'),
    });
  });

  it('reports any other api code with that code', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ response_code: 2, results: [] }));

    await expect(fetchQuestions(makeSettings())).rejects.toMatchObject({ code: 2 });
  });
});
