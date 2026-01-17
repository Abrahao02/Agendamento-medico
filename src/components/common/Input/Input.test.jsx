// ============================================
// 📁 src/components/common/Input/Input.test.jsx
// Testes para componente Input
// ============================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input, { TextArea, InputGroup } from './Input';

describe('Input', () => {
  it('deve renderizar input', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('deve renderizar label quando fornecido', () => {
    render(<Input label="Nome" />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('deve mostrar asterisco quando required', () => {
    render(<Input label="Email" required />);
    const label = screen.getByText('Email');
    expect(label.querySelector('.input-required')).toBeInTheDocument();
  });

  it('deve renderizar mensagem de erro quando fornecido', () => {
    render(<Input error="Campo obrigatório" />);
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Campo obrigatório')).toHaveClass('input-error-message');
  });

  it('deve renderizar texto de ajuda quando fornecido', () => {
    render(<Input helper="Digite seu nome completo" />);
    expect(screen.getByText('Digite seu nome completo')).toBeInTheDocument();
    expect(screen.getByText('Digite seu nome completo')).toHaveClass('input-helper-text');
  });

  it('não deve mostrar helper quando há erro', () => {
    render(<Input error="Erro" helper="Ajuda" />);
    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.queryByText('Ajuda')).not.toBeInTheDocument();
  });

  it('deve aplicar classe de erro quando há erro', () => {
    render(<Input error="Erro" />);
    expect(screen.getByRole('textbox')).toHaveClass('input-error');
  });

  it('deve renderizar ícone à esquerda', () => {
    const icon = <span data-testid="left-icon">@</span>;
    render(<Input leftIcon={icon} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox').parentElement).toHaveClass('input-with-left-icon');
  });

  it('deve renderizar ícone à direita', () => {
    const icon = <span data-testid="right-icon">✓</span>;
    render(<Input rightIcon={icon} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox').parentElement).toHaveClass('input-with-right-icon');
  });

  it('deve aplicar tamanho correto', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('input-sm');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('input-lg');
  });

  it('deve aplicar fullWidth quando especificado', () => {
    render(<Input fullWidth />);
    expect(screen.getByRole('textbox')).toHaveClass('input-full-width');
    expect(screen.getByRole('textbox').closest('.input-wrapper')).toHaveClass('input-wrapper-full-width');
  });

  it('deve desabilitar input quando disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveClass('input-disabled');
  });

  it('deve aplicar type correto', () => {
    const { rerender, container } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    // Password inputs don't have role="textbox" by default, so we query by type directly
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('deve aplicar placeholder', () => {
    render(<Input placeholder="Digite aqui" />);
    expect(screen.getByPlaceholderText('Digite aqui')).toBeInTheDocument();
  });

  it('deve aplicar aria-invalid quando há erro', () => {
    render(<Input error="Erro" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('deve aplicar aria-describedby para erro', () => {
    render(<Input error="Erro" id="test-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('deve aplicar aria-describedby para helper', () => {
    render(<Input helper="Ajuda" id="test-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
  });

  it('deve permitir onChange', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('deve aplicar className customizada', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });
});

describe('TextArea', () => {
  it('deve renderizar textarea', () => {
    render(<TextArea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('deve renderizar label quando fornecido', () => {
    render(<TextArea label="Descrição" />);
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
  });

  it('deve aplicar número de linhas', () => {
    render(<TextArea rows={10} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '10');
  });

  it('deve renderizar mensagem de erro', () => {
    render(<TextArea error="Erro" />);
    expect(screen.getByText('Erro')).toBeInTheDocument();
  });

  it('deve aplicar fullWidth quando especificado', () => {
    render(<TextArea fullWidth />);
    expect(screen.getByRole('textbox')).toHaveClass('textarea-full-width');
  });
});

describe('InputGroup', () => {
  it('deve renderizar grupo de inputs', () => {
    render(
      <InputGroup>
        <Input placeholder="Input 1" />
        <Input placeholder="Input 2" />
      </InputGroup>
    );
    
    expect(screen.getByPlaceholderText('Input 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Input 2')).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(
      <InputGroup className="custom-group">
        <Input />
      </InputGroup>
    );
    
    expect(container.firstChild).toHaveClass('custom-group');
  });
});
