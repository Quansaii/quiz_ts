import { describe, expect, it } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('returns an empty array for an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('returns a single element array unchanged', () => {
    expect(shuffle(['a'])).toEqual(['a']);
  });

  it('keeps all elements and the same length', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(items);

    expect(result).toHaveLength(items.length);
    expect([...result].sort((a, b) => a - b)).toEqual(items);
  });

  it('does not mutate the original array', () => {
    const items = ['a', 'b', 'c', 'd'];
    shuffle(items, () => 0);

    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('returns a new array', () => {
    const items = ['a', 'b', 'c'];

    expect(shuffle(items)).not.toBe(items);
  });

  it('is deterministic for a fixed random function (always 0)', () => {
    expect(shuffle(['A', 'B', 'C'], () => 0)).toEqual(['B', 'C', 'A']);
  });

  it('keeps the order when random always picks the current position', () => {
    expect(shuffle(['A', 'B', 'C'], () => 0.999)).toEqual(['A', 'B', 'C']);
  });

  it('works with objects and keeps the same references', () => {
    const first = { id: 1 };
    const second = { id: 2 };
    const result = shuffle([first, second], () => 0);

    expect(result).toContain(first);
    expect(result).toContain(second);
  });
});
