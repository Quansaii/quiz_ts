import { describe, expect, it } from 'vitest';
import { buildAnswers } from './buildAnswers';

describe('buildAnswers', () => {
  it('builds two answers for a true/false question', () => {
    const answers = buildAnswers('True', ['False']);

    expect(answers).toHaveLength(2);
    expect(answers.map((answer) => answer.text).sort()).toEqual(['False', 'True']);
  });

  it('builds four answers for a multiple choice question', () => {
    const answers = buildAnswers('Paris', ['Rome', 'Berlin', 'Madrid']);

    expect(answers).toHaveLength(4);
  });

  it('marks exactly one answer as correct', () => {
    const answers = buildAnswers('Paris', ['Rome', 'Berlin', 'Madrid']);
    const correct = answers.filter((answer) => answer.isCorrect);

    expect(correct).toHaveLength(1);
    expect(correct[0]?.text).toBe('Paris');
  });

  it('decodes HTML entities in every answer', () => {
    const answers = buildAnswers('Tom &amp; Jerry', ['&quot;Quoted&quot;', 'It&#039;s']);
    const texts = answers.map((answer) => answer.text);

    expect(texts).toContain('Tom & Jerry');
    expect(texts).toContain('"Quoted"');
    expect(texts).toContain("It's");
  });

  it('uses the isCorrect flag, not the text, when answers have equal text', () => {
    const answers = buildAnswers('Same', ['Same', 'Other']);

    expect(answers).toHaveLength(3);
    expect(answers.filter((answer) => answer.isCorrect)).toHaveLength(1);
    expect(answers.filter((answer) => answer.text === 'Same')).toHaveLength(2);
  });

  it('uses the given random function to shuffle', () => {
    const answers = buildAnswers('C', ['X', 'Y'], () => 0);

    expect(answers.map((answer) => answer.text)).toEqual(['X', 'Y', 'C']);
    expect(answers[2]?.isCorrect).toBe(true);
  });
});
