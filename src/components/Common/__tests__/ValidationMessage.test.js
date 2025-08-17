import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ValidationMessage from '../ValidationMessage';

describe('ValidationMessage', () => {
  it('renders error message when error is provided', () => {
    render(<ValidationMessage error="Este campo es obligatorio" field="email" />);
    
    expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument();
    expect(screen.getByTestId('validation-message-email')).toBeInTheDocument();
  });

  it('renders error object message', () => {
    const error = { message: 'Email inválido', type: 'validation' };
    render(<ValidationMessage error={error} field="email" />);
    
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });

  it('does not render when no error is provided', () => {
    render(<ValidationMessage error={null} field="email" />);
    
    expect(screen.queryByTestId('validation-message-email')).not.toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<ValidationMessage error="Error message" field="email" show={false} />);
    
    expect(screen.queryByTestId('validation-message-email')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ValidationMessage error="Error" field="email" className="custom-class" />);
    
    const element = screen.getByTestId('validation-message-email');
    expect(element).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<ValidationMessage error="Error message" field="email" />);
    
    const element = screen.getByTestId('validation-message-email');
    expect(element).toHaveAttribute('role', 'alert');
    expect(element).toHaveAttribute('aria-live', 'polite');
  });
});