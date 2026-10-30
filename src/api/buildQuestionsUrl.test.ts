import { describe, expect, it } from 'vitest';
import { makeSettings } from '../test/factories';
import { buildQuestionsUrl } from './buildQuestionsUrl';

const BASE = 'https://opentdb.com/api.php';

describe('buildQuestionsUrl', () => {
  it('contains only the amount for default settings', () => {
    expect(buildQuestionsUrl(makeSettings())).toBe(`${BASE}?amount=10`);
  });

  it('uses the selected amount', () => {
    expect(buildQuestionsUrl(makeSettings({ amount: 25 }))).toBe(`${BASE}?amount=25`);
  });

  it('adds the category when it is selected', () => {
    expect(buildQuestionsUrl(makeSettings({ categoryId: 9 }))).toBe(`${BASE}?amount=10&category=9`);
  });

  it('adds the difficulty unless it is any', () => {
    expect(buildQuestionsUrl(makeSettings({ difficulty: 'hard' }))).toBe(`${BASE}?amount=10&difficulty=hard`);
    expect(buildQuestionsUrl(makeSettings({ difficulty: 'any' }))).not.toContain('difficulty');
  });

  it('adds the question type unless it is any', () => {
    expect(buildQuestionsUrl(makeSettings({ type: 'boolean' }))).toBe(`${BASE}?amount=10&type=boolean`);
    expect(buildQuestionsUrl(makeSettings({ type: 'any' }))).not.toContain('type');
  });

  it('combines all parameters in a stable order', () => {
    const url = buildQuestionsUrl(
      makeSettings({ amount: 5, categoryId: 21, difficulty: 'medium', type: 'multiple' }),
    );

    expect(url).toBe(`${BASE}?amount=5&category=21&difficulty=medium&type=multiple`);
  });

  it('never puts null or any into the url', () => {
    const url = buildQuestionsUrl(makeSettings());

    expect(url).not.toContain('null');
    expect(url).not.toContain('any');
  });
});
