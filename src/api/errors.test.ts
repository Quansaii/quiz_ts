import { describe, expect, it } from 'vitest';
import { TriviaApiError } from './errors';

describe('TriviaApiError', () => {
  it('is an Error and a TriviaApiError', () => {
    const error = new TriviaApiError('Something failed', 5);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TriviaApiError);
  });

  it('stores the message and the code', () => {
    const error = new TriviaApiError('Too many requests', 5);

    expect(error.message).toBe('Too many requests');
    expect(error.code).toBe(5);
  });

  it('allows a null code for network errors', () => {
    expect(new TriviaApiError('Offline', null).code).toBeNull();
  });

  it('has its own name', () => {
    expect(new TriviaApiError('Oops', null).name).toBe('TriviaApiError');
  });
});
