import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorDisplay from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders error message when error is provided', () => {
    render(<ErrorDisplay error="Something went wrong" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByTestId('error-display-general')).toBeInTheDocument();
  });

  it('renders error object with message and details', () => {
    const error = {
      message: 'API Error',
      details: 'Server returned 500'
    };
    render(<ErrorDisplay error={error} type="api" />);
    
    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(screen.getByText('Server returned 500')).toBeInTheDocument();
  });

  it('does not render when no error is provided', () => {
    render(<ErrorDisplay error={null} />);
    
    expect(screen.queryByTestId('error-display-general')).not.toBeInTheDocument();
  });

  it('applies correct styles for different error types', () => {
    const { rerender } = render(<ErrorDisplay error="API Error" type="api" />);
    expect(screen.getByTestId('error-display-api')).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');

    rerender(<ErrorDisplay error="Network Error" type="network" />);
    expect(screen.getByTestId('error-display-network')).toHaveClass('bg-orange-50', 'border-orange-200', 'text-orange-800');

    rerender(<ErrorDisplay error="Warning" type="warning" />);
    expect(screen.getByTestId('error-display-warning')).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
  });

  it('shows dismiss button when dismissible is true', () => {
    const onDismiss = vi.fn();
    render(<ErrorDisplay error="Error" dismissible={true} onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText('Cerrar mensaje de error');
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show dismiss button when dismissible is false', () => {
    render(<ErrorDisplay error="Error" dismissible={false} />);
    
    expect(screen.queryByLabelText('Cerrar mensaje de error')).not.toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(<ErrorDisplay error="Error" showIcon={false} />);
    
    const container = screen.getByTestId('error-display-general');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ErrorDisplay error="Error message" />);
    
    const element = screen.getByTestId('error-display-general');
    expect(element).toHaveAttribute('role', 'alert');
    expect(element).toHaveAttribute('aria-live', 'assertive');
  });
});