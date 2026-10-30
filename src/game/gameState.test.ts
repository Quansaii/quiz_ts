import { describe, expect, it } from 'vitest';
import type { GameState } from '../types/quiz';
import { makeQuestion, makeSettings } from '../test/factories';
import { createInitialState, currentQuestion } from './gameState';

describe('createInitialState', () => {
  it('starts on the setup screen with default settings', () => {
    expect(createInitialState()).toEqual({
      status: 'setup',
      settings: { amount: 10, categoryId: null, difficulty: 'any', type: 'any' },
    });
  });

  it('returns a new object each time', () => {
    expect(createInitialState()).not.toBe(createInitialState());
  });
});

describe('currentQuestion', () => {
  const settings = makeSettings();
  const first = makeQuestion({ id: '0' });
  const second = makeQuestion({ id: '1', text: 'Second?' });

  it('returns the question at the current index', () => {
    const state: GameState = {
      status: 'question',
      settings,
      questions: [first, second],
      index: 1,
      selected: null,
      score: 0,
    };

    expect(currentQuestion(state)).toBe(second);
  });

  it('returns null for every status except question', () => {
    const states: GameState[] = [
      { status: 'setup', settings },
      { status: 'loading', settings },
      { status: 'error', settings, message: 'Oops' },
      { status: 'finished', settings, score: 1, total: 2 },
    ];

    for (const state of states) {
      expect(currentQuestion(state)).toBeNull();
    }
  });

  it('returns null when the index is out of range', () => {
    const state: GameState = {
      status: 'question',
      settings,
      questions: [first],
      index: 5,
      selected: null,
      score: 0,
    };

    expect(currentQuestion(state)).toBeNull();
  });
});
