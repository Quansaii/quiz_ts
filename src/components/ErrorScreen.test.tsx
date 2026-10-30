import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorScreen } from './ErrorScreen';

describe('ErrorScreen', () => {
  it('shows the error message as an alert', () => {
    render(<ErrorScreen message="Too many requests." dispatch={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Too many requests.');
  });

  it('dispatches START when "Try again" is clicked', () => {
    const dispatch = vi.fn();
    render(<ErrorScreen message="Oops" dispatch={dispatch} />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'START' });
  });

  it('dispatches RESTART when "Back to settings" is clicked', () => {
    const dispatch = vi.fn();
    render(<ErrorScreen message="Oops" dispatch={dispatch} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to settings' }));

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESTART' });
  });
});
