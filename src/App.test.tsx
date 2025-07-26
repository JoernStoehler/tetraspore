import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('displays the planet selection interface when loaded', () => {
    // Arrange
    // No setup needed for basic rendering test

    // Act
    render(<App />);

    // Assert
    expect(screen.getByRole('heading', { name: 'Planet Selection' })).toBeInTheDocument();
  });
});