import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AnswerButton } from './AnswerButton';

describe('AnswerButton', () => {
  it('renders the answer text', () => {
    render(<AnswerButton text="Paris" state="idle" disabled={false} onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Paris' })).toBeInTheDocument();
  });

  it.each(['idle', 'correct', 'wrong', 'dimmed'] as const)('adds the class for the %s state', (state) => {
    render(<AnswerButton text="Paris" state={state} disabled={false} onClick={vi.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('answer', `answer--${state}`);
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<AnswerButton text="Paris" state="idle" disabled={false} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and ignores clicks when disabled', () => {
    const onClick = vi.fn();
    render(<AnswerButton text="Paris" state="idle" disabled onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
