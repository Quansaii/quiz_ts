import {TriviaApiError} from './errors'
import {type ApiQuestionsResponse, type Question, type QuizSettings} from '../types/quiz'
import { buildQuestionsUrl } from './buildQuestionsUrl';
import { decodeHtml } from '../utils/decodeHtml';
import { buildAnswers } from '../utils/buildAnswers';

function messageForApiCode(code: number): string {
  if (code === 1) return 'По заданным параметрам нет вопросов';
  if (code === 5) return 'Слишком много запросов, подождите немного';
  return `Ошибка API, код ${code}`;
}

export async function fetchQuestions(settings: QuizSettings, signal?: AbortSignal): Promise<Question[]> {
  const url:string = buildQuestionsUrl(settings);
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

  let data: ApiQuestionsResponse;
  try {
    data = await response.json();
  } catch (error) {
    throw new TriviaApiError('Не удалось прочитать ответ сервера', null);
  }

  if (data.response_code !== 0) {
    throw new TriviaApiError(messageForApiCode(data.response_code), data.response_code);
  }
  
  const results: Question[] = data.results.map((result, index) => {
    return {
      id: String(index),
      category:result.category,
      difficulty:result.difficulty,
      text: decodeHtml(result.question),
      answers: buildAnswers(result.correct_answer, result.incorrect_answers)
    }
  });

  return results;
}
