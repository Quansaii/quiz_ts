import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResultScreen } from './ResultScreen';

describe('ResultScreen', () => {
  it('shows the score out of the total', () => {
    render(<ResultScreen score={7} total={10} onRestart={vi.fn()} />);

    expect(screen.getByText('You got 7/10')).toBeInTheDocument();
  });

  it('shows a zero score', () => {
    render(<ResultScreen score={0} total={5} onRestart={vi.fn()} />);

    expect(screen.getByText('You got 0/5')).toBeInTheDocument();
  });

  it('calls onRestart when "Play again" is clicked', () => {
    const onRestart = vi.fn();
    render(<ResultScreen score={1} total={2} onRestart={onRestart} />);

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
