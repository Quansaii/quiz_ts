import { describe, expect, it } from 'vitest';
import { timeForAnswer } from './gameConfig';
import { applyAnswer, calculatePoints } from './scoring';

describe('applyAnswer', () => {
  it('adds one point for a correct answer', () => {
    expect(applyAnswer(3, true)).toBe(4);
  });

  it('does not change the score for a wrong answer', () => {
    expect(applyAnswer(3, false)).toBe(3);
  });

  it('keeps a zero score after a wrong answer', () => {
    expect(applyAnswer(0, false)).toBe(0);
  });
});

describe('calculatePoints', () => {
  const leftAfter = (spentSeconds: number) => timeForAnswer - spentSeconds;

  it('gives no points when there is no time left', () => {
    expect(calculatePoints('hard', 0)).toBe(0);
  });

  it('gives no points for negative time', () => {
    expect(calculatePoints('hard', -3)).toBe(0);
  });

  it.each([
    ['easy', 1],
    ['medium', 2],
    ['hard', 3],
  ] as const)('gives %s questions %i base points', (difficulty, base) => {
    expect(calculatePoints(difficulty, leftAfter(25))).toBe(base);
  });

  it('adds 3 bonus points for an answer in under 5 seconds', () => {
    expect(calculatePoints('easy', leftAfter(2))).toBe(1 + 3);
  });

  it('adds 2 bonus points for 5 to 9 seconds', () => {
    expect(calculatePoints('easy', leftAfter(5))).toBe(1 + 2);
    expect(calculatePoints('easy', leftAfter(9))).toBe(1 + 2);
  });

  it('adds 1 bonus point for 10 to 19 seconds', () => {
    expect(calculatePoints('easy', leftAfter(10))).toBe(1 + 1);
    expect(calculatePoints('easy', leftAfter(19))).toBe(1 + 1);
  });

  it('adds no bonus for 20 seconds or more', () => {
    expect(calculatePoints('easy', leftAfter(20))).toBe(1);
  });

  it('combines difficulty and speed', () => {
    expect(calculatePoints('hard', leftAfter(1))).toBe(3 + 3);
  });
});
