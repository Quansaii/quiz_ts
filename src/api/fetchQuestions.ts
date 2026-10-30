import {TriviaApiError} from './errors'
import {type ApiQuestionsResponse, type Question, type QuizSettings} from '../types/quiz'
import { buildQuestionsUrl } from './buildQuestionsUrl';
import { decodeHtml } from '../utils/decodeHtml';
import { buildAnswers } from '../utils/buildAnswers';

function messageForApiCode(code: number): string {
  if (code === 1) return 'No questions found for the selected settings.';
  if (code === 5) return 'Too many requests. Please wait a few seconds and try again.';
  return `API error (code ${code}).`;
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
    throw new TriviaApiError('Connection problem. Please check your internet connection.', null);
  }

  if (!response.ok) {
    throw new TriviaApiError('The server returned an error.', response.status);
  }

  let data: ApiQuestionsResponse;
  try {
    data = await response.json();
  } catch (error) {
    throw new TriviaApiError('Could not read the server response.', null);
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
