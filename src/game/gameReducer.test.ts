import { describe, expect, it } from 'vitest';
import type { GameAction, GameState } from '../types/quiz';
import { makeQuestion, makeSettings } from '../test/factories';
import { gameReducer } from './gameReducer';

type QuestionState = Extract<GameState, { status: 'question' }>;

const settings = makeSettings();
const questions = [makeQuestion({ id: '0' }), makeQuestion({ id: '1', text: 'Second question?' })];

const setupState: GameState = { status: 'setup', settings };
const loadingState: GameState = { status: 'loading', settings };
const errorState: GameState = { status: 'error', settings, message: 'Oops' };
const finishedState: GameState = { status: 'finished', settings, score: 1, total: 2 };

function questionState(overrides: Partial<QuestionState> = {}): QuestionState {
  return {
    status: 'question',
    settings,
    questions,
    index: 0,
    selected: null,
    score: 0,
    ...overrides,
  };
}

describe('gameReducer: UPDATE_SETTINGS', () => {
  it('merges partial settings in the setup status', () => {
    const next = gameReducer(setupState, {
      type: 'UPDATE_SETTINGS',
      settings: { difficulty: 'hard' },
    });

    expect(next).toEqual({
      status: 'setup',
      settings: { ...settings, difficulty: 'hard' },
    });
  });

  it('does not mutate the previous state', () => {
    const before = structuredClone(setupState);
    gameReducer(setupState, { type: 'UPDATE_SETTINGS', settings: { amount: 20 } });

    expect(setupState).toEqual(before);
  });

  it.each([loadingState, errorState, questionState(), finishedState])(
    'is ignored in the $status status',
    (state) => {
      const next = gameReducer(state, { type: 'UPDATE_SETTINGS', settings: { amount: 20 } });

      expect(next).toBe(state);
    },
  );
});

describe('gameReducer: START', () => {
  it('moves from setup to loading and keeps the settings', () => {
    expect(gameReducer(setupState, { type: 'START' })).toEqual({ status: 'loading', settings });
  });

  it('moves from error to loading (retry)', () => {
    expect(gameReducer(errorState, { type: 'START' })).toEqual({ status: 'loading', settings });
  });

  it.each([loadingState, questionState(), finishedState])('is ignored in the $status status', (state) => {
    expect(gameReducer(state, { type: 'START' })).toBe(state);
  });
});

describe('gameReducer: LOADED', () => {
  it('moves from loading to the first question', () => {
    expect(gameReducer(loadingState, { type: 'LOADED', questions })).toEqual({
      status: 'question',
      settings,
      questions,
      index: 0,
      selected: null,
      score: 0,
    });
  });

  it('moves to error when there are no questions', () => {
    const next = gameReducer(loadingState, { type: 'LOADED', questions: [] });

    expect(next.status).toBe('error');
    expect(next).toMatchObject({ message: expect.any(String) });
  });

  it.each([setupState, errorState, questionState(), finishedState])(
    'is ignored in the $status status',
    (state) => {
      expect(gameReducer(state, { type: 'LOADED', questions })).toBe(state);
    },
  );
});

describe('gameReducer: LOAD_FAILED', () => {
  it('moves from loading to error with the given message', () => {
    expect(gameReducer(loadingState, { type: 'LOAD_FAILED', message: 'No network' })).toEqual({
      status: 'error',
      settings,
      message: 'No network',
    });
  });

  it.each([setupState, errorState, questionState(), finishedState])(
    'is ignored in the $status status',
    (state) => {
      expect(gameReducer(state, { type: 'LOAD_FAILED', message: 'No network' })).toBe(state);
    },
  );
});

describe('gameReducer: ANSWER', () => {
  it('increases the score and stores the selected index for a correct answer', () => {
    const next = gameReducer(questionState({ score: 2 }), { type: 'ANSWER', answerIndex: 0 });

    expect(next).toEqual(questionState({ score: 3, selected: 0 }));
  });

  it('stores the selected index without points for a wrong answer', () => {
    const next = gameReducer(questionState({ score: 2 }), { type: 'ANSWER', answerIndex: 1 });

    expect(next).toEqual(questionState({ score: 2, selected: 1 }));
  });

  it('ignores a second answer to the same question', () => {
    const answered = gameReducer(questionState(), { type: 'ANSWER', answerIndex: 0 });
    const again = gameReducer(answered, { type: 'ANSWER', answerIndex: 0 });

    expect(again).toBe(answered);
  });

  it('moves to error when the answer index does not exist', () => {
    const next = gameReducer(questionState(), { type: 'ANSWER', answerIndex: 99 });

    expect(next.status).toBe('error');
  });

  it('does not mutate the previous state', () => {
    const state = questionState();
    const before = structuredClone(state);
    gameReducer(state, { type: 'ANSWER', answerIndex: 0 });

    expect(state).toEqual(before);
  });

  it.each([setupState, loadingState, errorState, finishedState])(
    'is ignored in the $status status',
    (state) => {
      expect(gameReducer(state, { type: 'ANSWER', answerIndex: 0 })).toBe(state);
    },
  );
});

describe('gameReducer: TIMEOUT', () => {
  it('closes an open question without points', () => {
    const next = gameReducer(questionState({ score: 2 }), { type: 'TIMEOUT' });

    expect(next).toEqual(questionState({ score: 2, selected: -1 }));
  });

  it('does nothing when the question is already answered', () => {
    const answered = questionState({ selected: 0, score: 1 });

    expect(gameReducer(answered, { type: 'TIMEOUT' })).toBe(answered);
  });

  it.each([setupState, loadingState, errorState, finishedState])(
    'is ignored in the $status status',
    (state) => {
      expect(gameReducer(state, { type: 'TIMEOUT' })).toBe(state);
    },
  );
});

describe('gameReducer: NEXT', () => {
  it('is ignored while the question is still open', () => {
    const open = questionState();

    expect(gameReducer(open, { type: 'NEXT' })).toBe(open);
  });

  it('moves to the next question and clears the selection', () => {
    const next = gameReducer(questionState({ selected: 0, score: 1 }), { type: 'NEXT' });

    expect(next).toEqual(questionState({ index: 1, selected: null, score: 1 }));
  });

  it('moves to the next question after a timeout', () => {
    const next = gameReducer(questionState({ selected: -1 }), { type: 'NEXT' });

    expect(next).toEqual(questionState({ index: 1, selected: null }));
  });

  it('finishes the game after the last question', () => {
    const next = gameReducer(questionState({ index: 1, selected: 0, score: 2 }), { type: 'NEXT' });

    expect(next).toEqual({ status: 'finished', settings, score: 2, total: 2 });
  });

  it.each([setupState, loadingState, errorState, finishedState])(
    'is ignored in the $status status',
    (state) => {
      expect(gameReducer(state, { type: 'NEXT' })).toBe(state);
    },
  );
});

describe('gameReducer: RESTART', () => {
  it.each([errorState, finishedState])('moves from $status to setup and keeps the settings', (state) => {
    expect(gameReducer(state, { type: 'RESTART' })).toEqual(setupState);
  });

  it.each([setupState, loadingState, questionState()])('is ignored in the $status status', (state) => {
    expect(gameReducer(state, { type: 'RESTART' })).toBe(state);
  });
});

describe('gameReducer: a full game', () => {
  it('plays two questions from setup to the result and back', () => {
    const actions: GameAction[] = [
      { type: 'UPDATE_SETTINGS', settings: { amount: 2 } },
      { type: 'START' },
      { type: 'LOADED', questions },
      { type: 'ANSWER', answerIndex: 0 },
      { type: 'NEXT' },
      { type: 'TIMEOUT' },
      { type: 'NEXT' },
    ];

    const finished = actions.reduce(gameReducer, setupState);

    expect(finished).toEqual({
      status: 'finished',
      settings: { ...settings, amount: 2 },
      score: 1,
      total: 2,
    });
    expect(gameReducer(finished, { type: 'RESTART' })).toEqual({
      status: 'setup',
      settings: { ...settings, amount: 2 },
    });
  });
});
