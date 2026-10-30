import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingScreen } from './LoadingScreen';

describe('LoadingScreen', () => {
  it('announces the loading state to assistive technology', () => {
    render(<LoadingScreen />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading questions...');
  });
});
