// ============================================
// 📁 src/components/common/Button/Button.test.jsx
// Testes para componente Button
// ============================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';
import { ButtonGroup } from './Button';

describe('Button', () => {
  it('deve renderizar texto do botão', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onClick quando disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Clique</Button>);
    
    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('não deve chamar onClick quando loading', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Clique</Button>);
    
    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('deve mostrar loading state', () => {
    render(<Button loading>Salvar</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-loading');
    expect(button).toBeDisabled();
  });

  it.each([
    ['primary', 'btn-primary'],
    ['secondary', 'btn-secondary'],
    ['danger', 'btn-danger']
  ])('deve aplicar variante %s corretamente', (variant, expectedClass) => {
    render(<Button variant={variant}>Botão</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it.each([
    ['sm', 'btn-sm'],
    ['lg', 'btn-lg']
  ])('deve aplicar tamanho %s corretamente', (size, expectedClass) => {
    render(<Button size={size}>Botão</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it('deve aplicar fullWidth quando especificado', () => {
    render(<Button fullWidth>Botão</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-full-width');
  });

  it('deve renderizar ícone à esquerda', () => {
    const icon = <span data-testid="left-icon">←</span>;
    render(<Button leftIcon={icon}>Botão</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('deve renderizar ícone à direita', () => {
    const icon = <span data-testid="right-icon">→</span>;
    render(<Button rightIcon={icon}>Botão</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('não deve renderizar ícones quando loading', () => {
    const leftIcon = <span data-testid="left-icon">←</span>;
    const rightIcon = <span data-testid="right-icon">→</span>;
    render(<Button loading leftIcon={leftIcon} rightIcon={rightIcon}>Botão</Button>);
    
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    render(<Button className="custom-class">Botão</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('deve renderizar como elemento customizado quando especificado', () => {
    render(<Button as="a" href="/test">Link</Button>);
    const link = screen.getByText('Link').closest('a');
    expect(link).toBeInTheDocument();
    expect(link?.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('deve aplicar aria-disabled para elementos não-button quando disabled', () => {
    render(<Button as="div" disabled>Div Button</Button>);
    const div = screen.getByText('Div Button').closest('div');
    expect(div).toBeInTheDocument();
    expect(div).toHaveAttribute('aria-disabled', 'true');
    expect(div).toHaveAttribute('tabIndex', '-1');
  });

  it.each([
    ['submit', 'submit'],
    ['reset', 'reset'],
    ['button', 'button']
  ])('deve aplicar type %s corretamente', (type, expectedType) => {
    render(<Button type={type}>Botão</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', expectedType);
  });
});

describe('ButtonGroup', () => {
  it('deve renderizar grupo de botões', () => {
    render(
      <ButtonGroup>
        <Button>Botão 1</Button>
        <Button>Botão 2</Button>
      </ButtonGroup>
    );
    
    expect(screen.getByText('Botão 1')).toBeInTheDocument();
    expect(screen.getByText('Botão 2')).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(
      <ButtonGroup className="custom-group">
        <Button>Botão</Button>
      </ButtonGroup>
    );
    
    expect(container.firstChild).toHaveClass('custom-group');
  });
});
