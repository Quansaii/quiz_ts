export class TriviaApiError extends Error {
  code: number | null;

  constructor(message: string, code: number | null) {
    super(message);
    this.name = 'TriviaApiError';  
    this.code = code;
  }
}