import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormField from '../FormField';

describe('FormField', () => {
  it('renders input with label', () => {
    render(<FormField name="email" label="Email Address" />);
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
  });

  it('shows required asterisk when required is true', () => {
    render(<FormField name="email" label="Email" required={true} />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const onChange = vi.fn();
    render(<FormField name="email" onChange={onChange} />);
    
    const input = screen.getByTestId('form-field-email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('shows validation error on blur', async () => {
    render(
      <FormField 
        name="email" 
        label="Email"
        validation={{ required: true }}
        value=""
      />
    );
    
    const input = screen.getByTestId('form-field-email');
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument();
    });
  });

  it('shows validation success icon for valid input', async () => {
    render(
      <FormField 
        name="email" 
        label="Email"
        validation={{ required: true, email: true }}
        value="test@example.com"
      />
    );
    
    const input = screen.getByTestId('form-field-email');
    fireEvent.blur(input);
    
    await waitFor(() => {
      const container = screen.getByTestId('form-field-email').parentElement;
      expect(container.querySelector('svg.text-green-500')).toBeInTheDocument();
    });
  });

  it('applies error styles when validation fails', async () => {
    render(
      <FormField 
        name="email" 
        label="Email"
        validation={{ required: true }}
        value=""
      />
    );
    
    const input = screen.getByTestId('form-field-email');
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(input).toHaveClass('border-red-300', 'text-red-900');
    });
  });

  it('disables input when disabled prop is true', () => {
    render(<FormField name="email" disabled={true} />);
    
    const input = screen.getByTestId('form-field-email');
    expect(input).toBeDisabled();
  });

  it('sets proper accessibility attributes', () => {
    render(<FormField name="email" label="Email" required={true} />);
    
    const input = screen.getByTestId('form-field-email');
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('required');
  });

  it('validates on change when showValidationOnChange is true', async () => {
    render(
      <FormField 
        name="email" 
        validation={{ email: true }}
        value="invalid-email"
        showValidationOnChange={true}
      />
    );
    
    const input = screen.getByTestId('form-field-email');
    // First blur to mark as touched
    fireEvent.blur(input);
    
    // Then change to trigger validation
    fireEvent.change(input, { target: { value: 'still-invalid' } });
    
    await waitFor(() => {
      expect(screen.getByText('Por favor ingresa un email válido')).toBeInTheDocument();
    });
  });
});