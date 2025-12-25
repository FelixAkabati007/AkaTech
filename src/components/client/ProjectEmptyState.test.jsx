import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProjectEmptyState from './ProjectEmptyState';
import '@testing-library/jest-dom'; // Ensure jest-dom matchers are available

describe('ProjectEmptyState', () => {
  it('renders correctly with default text', () => {
    render(<ProjectEmptyState />);
    expect(screen.getByText('No Project Selected')).toBeInTheDocument();
    expect(
      screen.getByText(/Select a project from the list on the left/i)
    ).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<ProjectEmptyState />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('renders feature badges', () => {
    render(<ProjectEmptyState />);
    expect(screen.getByText('Track Progress')).toBeInTheDocument();
    expect(screen.getByText('Access Files')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'test-class';
    render(<ProjectEmptyState className={customClass} />);
    const container = screen.getByRole('status');
    expect(container).toHaveClass(customClass);
  });
});
