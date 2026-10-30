import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { timeForAnswer } from '../game/gameConfig';
import { makeQuestion } from '../test/factories';
import type { GameAction } from '../types/quiz';
import { QuestionScreen } from './QuestionScreen';

const question = makeQuestion();

function renderScreen(overrides: { selected?: number | null; index?: number; score?: number } = {}) {
  const dispatch = vi.fn<(action: GameAction) => void>();
  const view = render(
    <QuestionScreen
      question={question}
      index={overrides.index ?? 0}
      total={10}
      score={overrides.score ?? 0}
      selected={overrides.selected ?? null}
      dispatch={dispatch}
    />,
  );
  return { dispatch, ...view };
}

describe('QuestionScreen', () => {
  it('shows the question, category, progress and score', () => {
    renderScreen({ index: 2, score: 4 });

    expect(screen.getByRole('heading', { name: 'What is the capital of France?' })).toBeInTheDocument();
    expect(screen.getByText('Geography')).toBeInTheDocument();
    expect(screen.getByText('Question 3/10')).toBeInTheDocument();
    expect(screen.getByText('Score: 4')).toBeInTheDocument();
  });

  it('shows the remaining time', () => {
    renderScreen();

    expect(screen.getByRole('timer')).toHaveTextContent(`${timeForAnswer}s`);
  });

  it('renders a button for every answer', () => {
    renderScreen();

    for (const name of ['Paris', 'Rome', 'Berlin', 'Madrid']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('keeps the answers active before an answer is selected', () => {
    renderScreen();

    expect(screen.getByRole('button', { name: 'Paris' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Paris' })).toHaveClass('answer--idle');
  });

  it('does not show the Next button before an answer is selected', () => {
    renderScreen();

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('dispatches ANSWER with the index of the clicked answer', () => {
    const { dispatch } = renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Berlin' }));

    expect(dispatch).toHaveBeenCalledWith({ type: 'ANSWER', answerIndex: 2 });
  });

  it('highlights the correct and the wrong answer after a wrong choice', () => {
    renderScreen({ selected: 1 });

    expect(screen.getByRole('button', { name: 'Paris' })).toHaveClass('answer--correct');
    expect(screen.getByRole('button', { name: 'Rome' })).toHaveClass('answer--wrong');
    expect(screen.getByRole('button', { name: 'Berlin' })).toHaveClass('answer--dimmed');
    expect(screen.getByRole('button', { name: 'Madrid' })).toHaveClass('answer--dimmed');
  });

  it('highlights only the correct answer after a correct choice', () => {
    const { container } = renderScreen({ selected: 0 });

    expect(screen.getByRole('button', { name: 'Paris' })).toHaveClass('answer--correct');
    expect(container.querySelector('.answer--wrong')).toBeNull();
  });

  it('disables all answers after an answer is selected', () => {
    renderScreen({ selected: 1 });

    for (const name of ['Paris', 'Rome', 'Berlin', 'Madrid']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });

  it('shows the Next button after an answer and dispatches NEXT', () => {
    const { dispatch } = renderScreen({ selected: 0 });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(dispatch).toHaveBeenCalledWith({ type: 'NEXT' });
  });

  it('shows the correct answer and the Next button after a timeout', () => {
    const { container } = renderScreen({ selected: -1 });

    expect(screen.getByRole('button', { name: 'Paris' })).toHaveClass('answer--correct');
    expect(container.querySelector('.answer--wrong')).toBeNull();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('dispatches TIMEOUT when the time runs out', () => {
    vi.useFakeTimers();
    const { dispatch } = renderScreen();

    act(() => {
      vi.advanceTimersByTime(timeForAnswer * 1000);
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'TIMEOUT' });
  });

  it('does not run the timer after an answer is selected', () => {
    vi.useFakeTimers();
    const { dispatch } = renderScreen({ selected: 0 });

    act(() => {
      vi.advanceTimersByTime(timeForAnswer * 1000);
    });

    expect(dispatch).not.toHaveBeenCalled();
  });
});
