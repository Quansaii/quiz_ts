import type { ApiQuestion, Question, QuizSettings } from '../types/quiz';

export function makeSettings(overrides: Partial<QuizSettings> = {}): QuizSettings {
  return {
    amount: 10,
    categoryId: null,
    difficulty: 'any',
    type: 'any',
    ...overrides,
  };
}

export function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: '0',
    category: 'Geography',
    difficulty: 'easy',
    text: 'What is the capital of France?',
    answers: [
      { text: 'Paris', isCorrect: true },
      { text: 'Rome', isCorrect: false },
      { text: 'Berlin', isCorrect: false },
      { text: 'Madrid', isCorrect: false },
    ],
    ...overrides,
  };
}

export function makeApiQuestion(overrides: Partial<ApiQuestion> = {}): ApiQuestion {
  return {
    type: 'multiple',
    difficulty: 'easy',
    category: 'Geography',
    question: 'What is the capital of France?',
    correct_answer: 'Paris',
    incorrect_answers: ['Rome', 'Berlin', 'Madrid'],
    ...overrides,
  };
}

export function fakeResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response;
}

export function brokenJsonResponse(): Response {
  return {
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected token');
    },
  } as unknown as Response;
}
