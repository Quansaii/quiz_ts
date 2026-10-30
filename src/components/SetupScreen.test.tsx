import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCategories } from '../hooks/useCategories';
import { makeSettings } from '../test/factories';
import type { GameAction, QuizSettings } from '../types/quiz';
import { SetupScreen } from './SetupScreen';

vi.mock('../hooks/useCategories', () => ({ useCategories: vi.fn() }));

const mockUseCategories = vi.mocked(useCategories);

function renderScreen(settings: QuizSettings = makeSettings()) {
  const dispatch = vi.fn<(action: GameAction) => void>();
  render(<SetupScreen settings={settings} dispatch={dispatch} />);
  return dispatch;
}

describe('SetupScreen', () => {
  beforeEach(() => {
    mockUseCategories.mockReturnValue({
      categories: [
        { id: 9, name: 'General Knowledge' },
        { id: 21, name: 'Sports' },
      ],
      loading: false,
      error: null,
    });
  });

  it('shows "Any category" first and then the loaded categories', () => {
    renderScreen();

    const options = screen.getAllByRole('option', { name: /Any category|General Knowledge|Sports/ });

    expect(options.map((option) => option.textContent)).toEqual([
      'Any category',
      'General Knowledge',
      'Sports',
    ]);
  });

  it('shows the current settings in the fields', () => {
    renderScreen(makeSettings({ categoryId: 21, type: 'boolean', difficulty: 'hard', amount: 15 }));

    expect(screen.getByLabelText('Category')).toHaveValue('21');
    expect(screen.getByLabelText('Question type')).toHaveValue('boolean');
    expect(screen.getByLabelText('Difficulty')).toHaveValue('hard');
    expect(screen.getByLabelText('Number of questions')).toHaveValue(15);
  });

  it('dispatches UPDATE_SETTINGS with a numeric category id', () => {
    const dispatch = renderScreen();

    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '21' } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_SETTINGS', settings: { categoryId: 21 } });
  });

  it('dispatches a null category when "Any category" is selected', () => {
    const dispatch = renderScreen(makeSettings({ categoryId: 9 }));

    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '' } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_SETTINGS', settings: { categoryId: null } });
  });

  it('dispatches UPDATE_SETTINGS when the question type changes', () => {
    const dispatch = renderScreen();

    fireEvent.change(screen.getByLabelText('Question type'), { target: { value: 'multiple' } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_SETTINGS', settings: { type: 'multiple' } });
  });

  it('dispatches UPDATE_SETTINGS when the difficulty changes', () => {
    const dispatch = renderScreen();

    fireEvent.change(screen.getByLabelText('Difficulty'), { target: { value: 'medium' } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_SETTINGS', settings: { difficulty: 'medium' } });
  });

  it('dispatches UPDATE_SETTINGS when the amount changes', () => {
    const dispatch = renderScreen();

    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '15' } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_SETTINGS', settings: { amount: 15 } });
  });

  it.each([
    ['0', 1],
    ['-5', 1],
    ['100', 50],
    ['7.6', 8],
  ])('keeps the amount between 1 and 50 (%s becomes %i)', (typed, expected) => {
    const dispatch = renderScreen();

    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: typed } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_SETTINGS', settings: { amount: expected } });
  });

  it('ignores an empty amount', () => {
    const dispatch = renderScreen();

    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '' } });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches START when the start button is clicked', () => {
    const dispatch = renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Start quiz' }));

    expect(dispatch).toHaveBeenCalledWith({ type: 'START' });
  });

  it('disables the start button while the categories are loading', () => {
    mockUseCategories.mockReturnValue({ categories: [], loading: true, error: null });
    renderScreen();

    expect(screen.getByRole('button', { name: 'Start quiz' })).toBeDisabled();
  });

  it('shows an error when the categories could not be loaded', () => {
    mockUseCategories.mockReturnValue({ categories: [], loading: false, error: 'Could not load categories.' });
    renderScreen();

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load categories.');
    expect(screen.getByRole('button', { name: 'Start quiz' })).toBeEnabled();
  });

  it('does not show an alert when there is no error', () => {
    renderScreen();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
