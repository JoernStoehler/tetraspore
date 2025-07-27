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
    // The new planet selection view shows Galaxy View heading
    expect(screen.getAllByRole('heading', { name: 'Galaxy View' })[0]).toBeInTheDocument();
    // And has the navigation bar
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});