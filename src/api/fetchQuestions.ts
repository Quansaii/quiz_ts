import {TriviaApiError} from './errors'
import type {ApiQuestion, ApiQuestionsResponse} from '../types/quiz'

function messageForApiCode(code: number): string {
  if (code === 1) return 'По заданным параметрам нет вопросов';
  if (code === 5) return 'Слишком много запросов, подождите немного';
  return `Ошибка API, код ${code}`;
}

export async function fetchQuestions(url: string, signal?: AbortSignal): Promise<ApiQuestion[]> {
  let response: Response;
  try {
    response = await fetch(url, {signal});
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new TriviaApiError('Проблемы с соединением', null);
  }

  if (!response.ok) {
    throw new TriviaApiError('Сервер вернул ошибку', response.status);
  }

  const data: ApiQuestionsResponse = await response.json();
  if (data.response_code !== 0) {
    throw new TriviaApiError(messageForApiCode(data.response_code), data.response_code);
  }
  return data.results;
}
