import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { timeForAnswer } from './game/gameConfig';
import { fakeResponse, makeApiQuestion } from './test/factories';

const fetchMock = vi.fn();

const categoriesBody = { trivia_categories: [{ id: 9, name: 'General Knowledge' }] };

function questionsBody() {
  return {
    response_code: 0,
    results: [
      makeApiQuestion({
        question: 'Capital of France?',
        correct_answer: 'Paris',
        incorrect_answers: ['Rome', 'Berlin', 'Madrid'],
      }),
      makeApiQuestion({
        question: 'What is 2 + 2?',
        correct_answer: '4',
        incorrect_answers: ['3', '5', '22'],
      }),
    ],
  };
}

function isCategoriesRequest(input: unknown): boolean {
  return String(input).includes('api_category');
}

async function startQuiz() {
  const start = await screen.findByRole('button', { name: 'Start quiz' });
  await waitFor(() => expect(start).toBeEnabled());
  fireEvent.click(start);
}

describe('App', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (input: unknown) =>
      isCategoriesRequest(input) ? fakeResponse(categoriesBody) : fakeResponse(questionsBody()),
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  it('starts on the setup screen and loads the categories', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Trivia Quiz' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'General Knowledge' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start quiz' })).toBeEnabled();
  });

  it('requests questions without any placeholder filters', async () => {
    render(<App />);

    await startQuiz();
    await screen.findByText('Capital of France?');

    expect(fetchMock).toHaveBeenCalledWith('https://opentdb.com/api.php?amount=10', expect.anything());
  });

  it('sends the selected settings to the api', async () => {
    render(<App />);

    await screen.findByRole('option', { name: 'General Knowledge' });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '9' } });
    fireEvent.change(screen.getByLabelText('Difficulty'), { target: { value: 'hard' } });
    fireEvent.change(screen.getByLabelText('Question type'), { target: { value: 'multiple' } });
    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '2' } });
    await startQuiz();
    await screen.findByText('Capital of France?');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://opentdb.com/api.php?amount=2&category=9&difficulty=hard&type=multiple',
      expect.anything(),
    );
  });

  it('plays a whole game and shows the result', async () => {
    render(<App />);

    await startQuiz();

    expect(await screen.findByText('Capital of France?')).toBeInTheDocument();
    expect(screen.getByText('Question 1/2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Paris' }));
    expect(screen.getByRole('button', { name: 'Paris' })).toHaveClass('answer--correct');
    expect(screen.getByText('Score: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('Question 2/2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByRole('button', { name: '3' })).toHaveClass('answer--wrong');
    expect(screen.getByRole('button', { name: '4' })).toHaveClass('answer--correct');
    expect(screen.getByText('Score: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByRole('heading', { name: 'Quiz finished' })).toBeInTheDocument();
    expect(screen.getByText('You got 1/2')).toBeInTheDocument();
  });

  it('returns to the setup screen with "Play again"', async () => {
    render(<App />);

    await startQuiz();
    await screen.findByText('Capital of France?');
    fireEvent.click(screen.getByRole('button', { name: 'Paris' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('What is 2 + 2?');
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Play again' }));

    expect(await screen.findByRole('button', { name: 'Start quiz' })).toBeInTheDocument();
  });

  it('starts every question with a fresh timer after a timeout', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    render(<App />);

    await startQuiz();
    await screen.findByText('Capital of France?');

    act(() => {
      vi.advanceTimersByTime(timeForAnswer * 1000);
    });
    expect(screen.getByRole('button', { name: 'Paris' })).toHaveClass('answer--correct');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('What is 2 + 2?');

    expect(screen.getByRole('timer')).toHaveTextContent(`${timeForAnswer}s`);
    expect(screen.getByRole('button', { name: '4' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('shows an error when there are no questions and allows a retry', async () => {
    let questionRequests = 0;
    fetchMock.mockImplementation(async (input: unknown) => {
      if (isCategoriesRequest(input)) {
        return fakeResponse(categoriesBody);
      }
      questionRequests += 1;
      return questionRequests === 1
        ? fakeResponse({ response_code: 1, results: [] })
        : fakeResponse(questionsBody());
    });
    render(<App />);

    await startQuiz();

    expect(await screen.findByRole('alert')).toHaveTextContent('No questions found for the selected settings.');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Capital of France?')).toBeInTheDocument();
  });

  it('shows a connection error and can go back to the settings', async () => {
    fetchMock.mockImplementation(async (input: unknown) => {
      if (isCategoriesRequest(input)) {
        return fakeResponse(categoriesBody);
      }
      throw new TypeError('Failed to fetch');
    });
    render(<App />);

    await startQuiz();

    expect(await screen.findByRole('alert')).toHaveTextContent('Connection problem');

    fireEvent.click(screen.getByRole('button', { name: 'Back to settings' }));

    expect(await screen.findByRole('button', { name: 'Start quiz' })).toBeInTheDocument();
  });

  it('keeps the chosen settings after an error', async () => {
    fetchMock.mockImplementation(async (input: unknown) => {
      if (isCategoriesRequest(input)) {
        return fakeResponse(categoriesBody);
      }
      return fakeResponse({ response_code: 5, results: [] });
    });
    render(<App />);

    await screen.findByRole('option', { name: 'General Knowledge' });
    fireEvent.change(screen.getByLabelText('Difficulty'), { target: { value: 'easy' } });
    await startQuiz();
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Back to settings' }));

    expect(await screen.findByLabelText('Difficulty')).toHaveValue('easy');
  });
});
